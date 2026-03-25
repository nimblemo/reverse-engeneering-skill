# /// script
# requires-python = ">=3.9"
# dependencies = ["gitpython"]
# ///
import os
import sys
import json
import argparse
import tempfile
import shutil
import subprocess
import re
from pathlib import Path

try:
    from git import Repo
except ImportError:
    Repo = None

SAFE_EXTENSIONS = {'.pdf', '.txt', '.md'}
SUPPORTED_EXTENSIONS = {'.py', '.js', '.ts', '.tsx', '.jsx', '.yaml', '.yml', '.json', '.sh', '.go', '.rs', '.c', '.cpp', '.h', '.hpp'}

# ----------------- nlm_answer.py functions -----------------

def run_nlm(args, use_json=True):
    # Force UTF-8 mode for child processes to avoid encoding issues on Windows
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"

    cmd = ["nlm"] + args
    if use_json:
        cmd.append("--json")

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding='utf-8',
            env=env,
            check=True
        )
        if use_json:
            return json.loads(result.stdout)
        else:
            return {"value": result.stdout}
    except subprocess.CalledProcessError as e:
        print(f"Error executing nlm: {e.stderr}", file=sys.stderr)
        return {"error": str(e), "stderr": e.stderr}
    except json.JSONDecodeError as e:
        # Some commands might not return valid JSON even with --json or if they fail
        if "result" in locals() and result.stdout:
             print(f"Failed to parse JSON. nlm output: {result.stdout}", file=sys.stderr)
             return {"error": "JSON decode error", "raw": result.stdout}
        return {"error": "JSON decode error", "raw": ""}
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        return {"error": str(e)}

def create_notebook(title):
    print(f"Creating notebook: {title}...")
    # 'create' does not support --json, so we parse the output for the ID
    data = run_nlm(["notebook", "create", title], use_json=False)
    if "error" in data:
        return None
    
    # Try to extract the ID from the output (usually printed like ✓ Notebook created: 123-456...)
    match = re.search(r'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{20,})', data["value"])
    if match:
        nb_id = match.group(1)
        print(f"Notebook created with ID: {nb_id}")
        return nb_id
    else:
        print(f"Warning: Could not find notebook ID in output: {data['value']}")
        # Fallback to listing notebooks to find the latest
        list_data = run_nlm(["notebook", "list"])
        if isinstance(list_data, list) and len(list_data) > 0:
            # Sort by date if possible or just take the first one if it matches the title
            for nb in list_data:
                if nb.get("title") == title:
                   print(f"Found existing notebook ID: {nb.get('id')}")
                   return nb.get("id")
        return None

def add_source(notebook_id, file_path):
    print(f"Adding source: {file_path}...", end=" ", flush=True)
    # 'source add' also does not support --json
    data = run_nlm(["source", "add", notebook_id, "--file", file_path], use_json=False)
    if "error" in data:
        print(f"Failed to add source {file_path}")
        return False
    print("Done")
    return True

def add_sources_from_dir(notebook_id, sources_dir):
    sources_path = Path(sources_dir)
    if not sources_path.exists():
        print(f"Sources directory not found: {sources_path}")
        return False

    ALLOWED_EXTENSIONS = SAFE_EXTENSIONS | SUPPORTED_EXTENSIONS

    # Recursively find all files
    exclude_dirs = {".git", "__pycache__", "venv", "node_modules", "dist", "build"}
    files = [
        f for f in sources_path.rglob("*") 
        if f.is_file() 
        # Skip files in excluded directories
        and not any(part in exclude_dirs for part in f.parts)
        # Skip dot-files and manifest
        and not f.name.startswith(".") 
        and f.name != ".notebooklm_manifest.json"
        # Only include allowed extensions
        and f.suffix.lower() in ALLOWED_EXTENSIONS
    ]
    files.sort(key=lambda x: str(x))
    
    print(f"Total files to upload: {len(files)}")
    
    success_count = 0
    for i, f in enumerate(files):
        print(f"[{i+1}/{len(files)}] ", end="")
        if add_source(notebook_id, str(f.absolute())):
            success_count += 1
            
    print(f"Successfully uploaded {success_count}/{len(files)} files.")
    return success_count == len(files)

def query_nlm(notebook_id, question, output_file=None):
    # 'query' supports --json
    data = run_nlm(["notebook", "query", notebook_id, question])
    if "error" in data:
        return None
        
    answer = data.get("value", {}).get("answer", "Answer not found in JSON")

    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(answer)
        print(f"Answer successfully saved to {output_file}")
    else:
        print(answer)
    return answer

# ----------------- preprocess.py functions -----------------

def get_all_files(root_dir, exclude_patterns=None):
    if exclude_patterns is None:
        exclude_patterns = [
            'node_modules', '.git', '.venv', '__pycache__', 
            '.next', 'dist', 'build', '.DS_Store'
        ]
    
    safe_files = []
    other_files = []
    
    for root, dirs, files in os.walk(root_dir):
        # Skip excluded dirs
        dirs[:] = [d for d in dirs if d not in exclude_patterns]
        
        for file in files:
            file_path = Path(root) / file
            ext = file_path.suffix.lower()
            if ext in SAFE_EXTENSIONS:
                safe_files.append(file_path)
            elif ext in SUPPORTED_EXTENSIONS:
                other_files.append(file_path)
                
    return safe_files, other_files

def merge_files(files_to_merge, output_folder, chunk_count, base_name="merged_source"):
    if not files_to_merge:
        return []
    
    merged_files = []
    # Simple chunking
    avg = len(files_to_merge) // chunk_count
    if avg == 0: avg = 1
    
    for i in range(chunk_count):
        chunk = files_to_merge[i*avg : (i+1)*avg if i < chunk_count-1 else len(files_to_merge)]
        if not chunk: continue
        
        merged_path = output_folder / f"{base_name}_{i+1}.txt"
        with open(merged_path, 'w', encoding='utf-8') as outfile:
            for fpath in chunk:
                try:
                    rel_path = fpath.relative_to(output_folder)
                except ValueError:
                    rel_path = fpath.name
                    
                outfile.write(f"\n--- FILE: {rel_path} ---\n")
                try:
                    with open(fpath, 'r', encoding='utf-8', errors='ignore') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"Error reading file: {e}\n")
                outfile.write("\n")
                
        merged_files.append(str(merged_path.absolute()))
        # Delete original files after merging
        for fpath in chunk:
            if fpath.exists():
                try:
                    fpath.unlink()
                except Exception as e:
                    # On Windows, files might be locked. Try to change mode and retry once.
                    try:
                        os.chmod(fpath, 0o777)
                        fpath.unlink()
                    except:
                        print(f"Warning: Could not delete {fpath}: {e}")
                
    return merged_files

def clean_artefacts(repo_dir):
    manifest_path = Path(repo_dir) / ".notebooklm_manifest.json"
    if not manifest_path.exists():
        print(f"No manifest found at {manifest_path}")
        return False
    
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            files = json.load(f)
        
        for fpath_str in files:
            fpath = Path(fpath_str)
            if fpath.exists():
                try:
                    fpath.unlink()
                    print(f"Deleted artifact: {fpath}")
                except Exception as e:
                    print(f"Failed to delete {fpath}: {e}")
        
        manifest_path.unlink()
        print("Artifact cleanup complete.")
        return True
    except Exception as e:
        print(f"Error during cleanup: {e}")
        return False

def remove_repo(repo_dir):
    repo_path = Path(repo_dir)
    try:
        if repo_path.exists():
            # Standard cleanup for git repos if needed, but shutil.rmtree usually works
            shutil.rmtree(repo_path, ignore_errors=True)
            if repo_path.exists():
                # If still exists, try again without ignore_errors or handle specifically
                print(f"Warning: Could not completely remove {repo_dir}")
            else:
                print(f"Repository {repo_dir} removed.")
            return True
        else:
            print(f"Path {repo_dir} does not exist.")
            return False
    except Exception as e:
        print(f"Error removing repository: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="BMad RE Auto Explorer Unified Script")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: prep
    parser_prep = subparsers.add_parser("prep", help="Preprocess repository for NotebookLM ingestion")
    parser_prep.add_argument("--repo_url", required=True, help="URL or local path to the repository")
    parser_prep.add_argument("--output_dir", default=None, help="Directory to clone into (optional)")
    parser_prep.add_argument("--max_sources", type=int, default=50, help="Maximum number of sources allowed")
    parser_prep.add_argument("--json", action="store_true", help="Output results in JSON format")

    # Command: clean
    parser_clean = subparsers.add_parser("clean", help="Clean artifacts or remove repo")
    parser_clean.add_argument("--target", required=True, help="Target directory (output_dir or repo_url)")
    parser_clean.add_argument("--clean-artefacts", action="store_true", help="Remove NotebookLM artifacts based on manifest")
    parser_clean.add_argument("--remove-repo", action="store_true", help="Delete the repository directory")
    parser_clean.add_argument("--json", action="store_true", help="Output results in JSON format")

    # Command: create
    parser_create = subparsers.add_parser("create", help="Create a NotebookLM notebook")
    parser_create.add_argument("title", help="Notebook title")

    # Command: add
    parser_add = subparsers.add_parser("add", help="Add a single source to a notebook")
    parser_add.add_argument("nb_id", help="Notebook ID")
    parser_add.add_argument("file_path", help="Path to file")

    # Command: upload
    parser_upload = subparsers.add_parser("upload", help="Upload a directory of sources to a notebook")
    parser_upload.add_argument("nb_id", help="Notebook ID")
    parser_upload.add_argument("dir_path", help="Path to directory")

    # Command: query
    parser_query = subparsers.add_parser("query", help="Query a notebook")
    parser_query.add_argument("nb_id", help="Notebook ID")
    parser_query.add_argument("question", help="Question to ask")
    parser_query.add_argument("output_file", nargs="?", help="Output file path (optional)")

    # Support old arguments for backwards compatibility
    if len(sys.argv) > 1 and sys.argv[1] not in ["prep", "clean", "create", "add", "upload", "query", "-h", "--help"]:
        if "--clean-artefacts" in sys.argv or "--remove-repo" in sys.argv:
            sys.argv.insert(1, "clean")
            target = None
            if "--output_dir" in sys.argv:
                idx = sys.argv.index("--output_dir")
                target = sys.argv[idx+1]
                sys.argv.pop(idx)
                sys.argv.pop(idx)
            elif "--repo_url" in sys.argv:
                idx = sys.argv.index("--repo_url")
                target = sys.argv[idx+1]
                sys.argv.pop(idx)
                sys.argv.pop(idx)
            if target:
                sys.argv.extend(["--target", target])
        elif "--repo_url" in sys.argv:
            sys.argv.insert(1, "prep")
            
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "clean":
        target = args.target
        if not target:
            print(json.dumps({"error": "Must provide --target for cleanup."}) if args.json else "Error: Must provide --target for cleanup.")
            sys.exit(1)
            
        repo_dir = Path(target).absolute()
        
        if args.clean_artefacts:
            clean_artefacts(repo_dir)
            
        if args.remove_repo:
            remove_repo(repo_dir)
            
        sys.exit(0)

    elif args.command == "prep":
        is_clone = False

        if args.repo_url.startswith(("http://", "https://", "git@")):
            if Repo is None:
                print(json.dumps({"error": "GitPython not installed but repo URL provided."}) if args.json else "Error: GitPython not installed.")
                sys.exit(1)
                
            target_dir = Path(args.output_dir or tempfile.mkdtemp(prefix="bmad_re_"))
            if not target_dir.exists():
                target_dir.mkdir(parents=True)
                
            try:
                # Check if directory is empty before cloning
                if any(target_dir.iterdir()):
                    repo_path = str(target_dir.absolute())
                else:
                    repo = Repo.clone_from(args.repo_url, target_dir)
                    repo.close()
                    repo_path = str(target_dir.absolute())
                    is_clone = True
            except Exception as e:
                print(json.dumps({"error": str(e)}) if args.json else f"Error cloning repo: {e}")
                sys.exit(1)
        else:
            repo_path = str(Path(args.repo_url).absolute())

        repo_dir = Path(repo_path)

        # 1. Get files
        safe_files, other_files = get_all_files(repo_dir)
        total_count = len(safe_files) + len(other_files)
        
        result_files = [str(f.absolute()) for f in safe_files]
        artifacts = [] # Track files created or modified for manifest
        
        # 2. Process "other" files
        if total_count > args.max_sources:
            # Merge others
            available_slots = args.max_sources - len(safe_files)
            if available_slots <= 0:
                # We must merge even safe files
                all_files = safe_files + other_files
                merged = merge_files(all_files, repo_dir, args.max_sources)
                result_files = merged
                artifacts.extend(merged)
            else:
                merged = merge_files(other_files, repo_dir, available_slots)
                result_files.extend(merged)
                artifacts.extend(merged)
        else:
            # Just rename others to .txt
            for fpath in other_files:
                new_path = fpath.with_suffix(fpath.suffix + ".txt")
                fpath.rename(new_path)
                result_files.append(str(new_path.absolute()))
                artifacts.append(str(new_path.absolute()))

        # 3. Cleanup .git
        git_dir = repo_dir / ".git"
        if git_dir.exists() and git_dir.is_dir():
            shutil.rmtree(git_dir, ignore_errors=True)

        # 4. Save manifest
        if artifacts:
            manifest_path = repo_dir / ".notebooklm_manifest.json"
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump(artifacts, f, indent=2)

        result = {
            "repo_path": str(repo_dir.absolute()),
            "is_clone": is_clone,
            "final_source_count": len(result_files),
            "files": result_files,
            "manifest_created": bool(artifacts)
        }

        if args.json:
            print(json.dumps(result))
        else:
            print(f"Final source count: {len(result_files)} (within limit of {args.max_sources})")
            print(f"Repo path: {repo_dir.absolute()}")
            if artifacts:
                print(f"Manifest created with {len(artifacts)} tracking entries.")

    elif args.command == "create":
        create_notebook(args.title)
    elif args.command == "add":
        add_source(args.nb_id, args.file_path)
    elif args.command == "upload":
        add_sources_from_dir(args.nb_id, args.dir_path)
    elif args.command == "query":
        query_nlm(args.nb_id, args.question, args.output_file)

if __name__ == "__main__":
    main()