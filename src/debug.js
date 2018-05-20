/* eslint no-console: 0 */
const chalk = require('chalk');

const PREFIX = '[ZStream]';

const log = (color, message) => console.log(`${color(PREFIX)} ${message}`);

const info = log.bind(null, chalk.green);

const error = log.bind(null, chalk.red);

const variable = text => chalk.yellow(text);

module.exports = {
    log,
    info,
    error,
    variable
};
