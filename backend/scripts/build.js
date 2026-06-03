const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { default: chalk } = require("chalk");

const pkg = require("../package.json");

const version = pkg.version;
const rootDist = path.join("dist", `v${version}`);
const appDist = path.join(rootDist, "app");

const startTime = Date.now();

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info(message) {
    console.log(chalk.cyan(`[${timestamp()}] [INFO]    ${message}`));
  },

  success(message) {
    console.log(chalk.green(`[${timestamp()}] [SUCCESS] ${message}`));
  },

  warn(message) {
    console.log(chalk.yellow(`[${timestamp()}] [WARN]    ${message}`));
  },

  error(message) {
    console.error(chalk.red(`[${timestamp()}] [ERROR]   ${message}`));
  },

  command(command) {
    console.log(chalk.gray(`[${timestamp()}] [COMMAND] ${command}`));
  },

  divider(title) {
    const line = "=".repeat(70);

    console.log(chalk.blue(line));
    console.log(chalk.blue.bold(`[${timestamp()}] ${title}`));
    console.log(chalk.blue(line));
  },
};

function run(command, description) {
  try {
    logger.info(description);
    logger.command(command);

    execSync(command, {
      stdio: "inherit",
    });

    logger.success(`${description} completed`);
  } catch (error) {
    logger.error(`${description} failed`);

    if (error.message) {
      console.error(chalk.red(`[${timestamp()}] [ERROR]   ${error.message}`));
    }

    process.exit(1);
  }
}

function copy(source, destination, description) {
  try {
    logger.info(description);

    if (!fs.existsSync(source)) {
      logger.warn(`Skipped missing path: ${source}`);
      return;
    }

    fs.cpSync(source, destination, {
      recursive: true,
    });

    logger.success(`${description} completed`);
  } catch (error) {
    logger.error(`${description} failed`);

    console.error(chalk.red(`[${timestamp()}] [ERROR]   ${error.message}`));

    process.exit(1);
  }
}

try {
  logger.divider(`Starting backend build v${version}`);

  logger.info(`Output directory: ${rootDist}`);

  logger.info(`Cleaning previous build for version ${version}`);

  fs.rmSync(rootDist, {
    recursive: true,
    force: true,
  });

  logger.success(`Cleaned ${rootDist}`);

  fs.mkdirSync(appDist, {
    recursive: true,
  });

  logger.success(`Created ${appDist}`);

  run(`tsc -p tsconfig.json --outDir "${appDist}"`, "Compiling TypeScript");

  run(
    `tsc-alias -p tsconfig.json --outDir "${appDist}"`,
    "Replacing TypeScript path aliases",
  );

  copy("public", path.join(appDist, "public"), "Copying public assets");

  copy("src/templates", path.join(appDist, "templates"), "Copying templates");

  copy("src/uploads", path.join(appDist, "uploads"), "Copying uploads");

  copy(
    "package.json",
    path.join(rootDist, "package.json"),
    "Copying package.json",
  );

  copy(
    "package-lock.json",
    path.join(rootDist, "package-lock.json"),
    "Copying package-lock.json",
  );

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  logger.divider("Build completed successfully");

  logger.success(`Version      : ${version}`);
  logger.success(`Output       : ${rootDist}`);
  logger.success(`Build Time   : ${duration}s`);
} catch (error) {
  logger.error("Unexpected build failure");

  console.error(error);

  process.exit(1);
}
