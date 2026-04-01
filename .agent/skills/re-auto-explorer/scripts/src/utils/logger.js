const chalk = require('chalk');

class Logger {
    constructor() {
        this.isJsonOutput = false;
    }

    setJsonOutput(value) {
        this.isJsonOutput = !!value;
    }

    log(...args) {
        if (!this.isJsonOutput) {
            console.log(...args);
        }
    }

    info(...args) {
        if (!this.isJsonOutput) {
            console.log(chalk.blue('info:'), ...args);
        }
    }

    success(...args) {
        if (!this.isJsonOutput) {
            console.log(chalk.green('success:'), ...args);
        }
    }

    warn(...args) {
        if (!this.isJsonOutput) {
            console.warn(chalk.yellow('warning:'), ...args);
        }
    }

    error(...args) {
        if (this.isJsonOutput) {
            console.error(JSON.stringify({ error: args.join(' ') }));
        } else {
            console.error(chalk.red('error:'), ...args);
        }
    }

    json(data) {
        if (this.isJsonOutput) {
            console.log(JSON.stringify(data));
        }
    }
}

module.exports = new Logger();
