# Shoutz0r (Frontend)

[![License](https://img.shields.io/github/license/Shoutz0r/frontend.svg?style=flat)](https://www.gnu.org/licenses/gpl-3.0.en.html)
[![CodeFactor](https://www.codefactor.io/repository/github/Shoutz0r/frontend/badge/main)](https://www.codefactor.io/repository/github/Shoutz0r/frontend/overview/main)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Shoutz0r_frontend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Shoutz0r_frontend)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Shoutz0r_frontend&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Shoutz0r_frontend)

1. [Introduction](#introduction)
2. [Front-end development](#frontend-development)
3. [Kindly Supported by](#kindly-supported-by)
4. [Sponsor this project](#sponsor-this-project)
5. [Recommended IDE setup](#recommended-ide-setup)

## Introduction

This is the frontend of shoutz0r.

Built using Vite, Vue 3 & Bootstrap.

Storybook can be found [here](https://shoutzor.com/storybook/app/master/). The Storybook stories can be found in [this repo](https://github.com/Shoutz0r/storybook).
Feel free to ask any questions in the `discussions`.

## Front-end development

To run a local webserver with hot-reload you can run:

```sh
npm run dev
```
Make sure to add `shoutzor.local` to your `hosts` file pointing to `127.0.0.1`; The website will then be available at `http://shoutzor.local:5173/`

If you change the URL or port to something else, make sure you modify the `FRONTEND_URL` environment variable accordingly for the `backend`.

## Kindly supported by

* [JetBrains](https://www.jetbrains.com/?from=Shoutz0r)
* [Navicat](https://www.navicat.com/)

## Sponsor this project

Shoutz0r is being developed entirely in my spare time. \
If you like this project, please consider sponsoring it using the button in the sidebar of this repo (or [click here](https://github.com/sponsors/xorinzor) ).\
Every little bit helps to buy me a beer or pizza, which keeps me going!

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).
