# Start and Testing pcomparator

This document describes how to set up your development environment to start and test pcomparator.
It also explains the basic mechanics of using `git`, `node`, and `npm`.

- [Start and Testing pcomparator](#start-and-testing-pcomparator)
  - [Prerequisite Software](#prerequisite-software)
  - [Getting the Sources](#getting-the-sources)
  - [Installing NPM Modules](#installing-npm-modules)
          - [Install pcomparator project dependencies (package.json)](#install-pcomparator-project-dependencies-packagejson)
  - [Start](#start)
  - [Running Tests Locally](#running-tests-locally)
  - [ Formatting your source code](#-formatting-your-source-code)
  - [Linting/verifying your source code](#lintingverifying-your-source-code)
  - [Publishing snapshot builds](#publishing-snapshot-builds)

See the [contribution guidelines](https://github.com/Clement-Muth/pcomparator/blob/master/CONTRIBUTING.md) if you'd like to contribute to pcomparator.

## Prerequisite Software

Before you can start and test pcomparator, you must install and configure the following products on your development machine:

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or [Windows](http://windows.github.com)); [GitHub's Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), (version specified in the engines field of [`package.json`](../package.json)) which is used to run a development web server, run tests, and generate distributable files.

* [Yarn](https://yarnpkg.com) (version specified in the engines field of [`package.json`](../package.json)) which is used to install dependencies.

* [Docker](https://www.docker.com/) (version specified in the [`README.md`](../README.md)) which is used to wrap our application

* [Mkcert](https://github.com/FiloSottile/mkcert) which is used to generate SSL certificates.


## Getting the Sources

Clone the pcomparator repository:

1. Login to your GitHub account or create one by following the instructions given
   [here](https://github.com/signup/free).
2. [Clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) the [main pcomparator repository](https://github.com/Clement-Muth/pcomparator).

```shell
# Clone your GitHub repository:
git clone https://github.com/Clement-Muth/pcomparator

# Go to the mono-web directory:
cd mono-web
```

## Installing NPM Modules

Next, install the modules needed to start and test pcomparator:

###### Install pcomparator project dependencies (package.json)
```shell
make install
```

## Start

To start pcomparator run:

```shell
make up
```

## Running Tests Locally

To run tests:

```shell
yarn lint:check             # Run the lint checker

yarn format:check          # Run the format checker

yarn typescript:check      # Run the TypeScript checker

yarn test                  # Run the jest suite tests (coming soon)
```

You should execute the 4 test suites before submitting a PR to github.

See [DEBUG.md](DEBUG.md) for information on debugging the code while running the unit tests.

All the tests are executed on our Continuous Integration infrastructure and a PR could only be merged once the tests pass.

- Actions fails if your code is not formatted properly,

## <a name="rome-format"></a> Formatting your source code

pcomparator uses [rome](https://rome.tools/) to format the source code. If the source code is not properly formatted, the CI will fail and the PR can not be merged.

You can automatically format your code by running:

``` shell
yarn format:fix
```

## Linting/verifying your source code

You can check that your code is properly formatted and adheres to coding style by running:

``` shell
yarn lint:check
```

## Publishing snapshot builds

When the `master` branch successfully builds, it automatically published build artifacts.
