const chalk = require('chalk');

exports.info = (message) => {
    console.log(chalk.green('[ZStream]') + ' ' + message);
}

exports.error = (message) => {
    console.error(chalk.red('[ZStream]') + ' ' + message);
}