import unittest
from unittest.mock import patch, MagicMock
import os
import sys

# Add parent dir to path to import validator
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import validator

class TestValidator(unittest.TestCase):
    @patch('subprocess.run')
    def test_check_nlm_success(self, mock_run):
        mock_run.return_value = MagicMock(returncode=0, stdout="nlm v1.0.0")
        available, detail = validator.check_nlm()
        self.assertTrue(available)
        self.assertEqual(detail, "nlm v1.0.0")

    @patch('subprocess.run')
    def test_check_nlm_not_found(self, mock_run):
        mock_run.side_effect = FileNotFoundError()
        available, detail = validator.check_nlm()
        self.assertFalse(available)
        self.assertEqual(detail, "nlm command not found")

    @patch('subprocess.run')
    def test_check_nlm_error(self, mock_run):
        mock_run.return_value = MagicMock(returncode=1)
        available, detail = validator.check_nlm()
        self.assertFalse(available)
        self.assertEqual(detail, "nlm returned non-zero exit code")

if __name__ == '__main__':
    unittest.main()
