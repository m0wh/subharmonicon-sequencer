# Front-end Boilerplate

## Usage

Click [here](https://github.com/m0wh/frontend-boilerplate-ts/generate) or on the green "Use this template" button on top to create a new repository with the same file structure. Then just clone it, replace what needs to be replaced in `package.json` (name, repository url...) and you are ready!

> **Tip 1:** you can add [github.com/m0wh/frontend-boilerplate-ts/generate](https://github.com/m0wh/frontend-boilerplate-ts/generate) to your bookmarks to create a repo in one click.

> **Tip 2:** you can create a function into your `.bash_profile` (or `.zshenv` etc.) to clone this repo, then `rm -rf .git` to reset the repository.
```sh
new () {
  mkdir -p -- "$1"
  cd -P -- "$1"
  git clone https://github.com/m0wh/frontend-boilerplate-ts.git .
  rm -rf .git
  cd ..
  echo "Created new front-end project: type 'cd $1' to enter."
}
```

## Commands

```sh
yarn # install dependencies
yarn start # run dev server
yarn build # builds your site
yarn deploy # builds and deploys your site to gh-pages branch
```

# To-do
- [ ] Configure GitHub Actions to deploy on push to master
