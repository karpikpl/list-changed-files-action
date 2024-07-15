# List files changed in a Pull Request

[![GitHub Super-Linter](https://github.com/karpikpl/sample-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/karpikpl/sample-action/actions/workflows/ci.yml/badge.svg)

GitHub Action that lists all files changed (were added, modified) in the
provided pull request.

## Usage

### Basic

You need to add permissions for this tool.

```yaml
permissions:
  contents: read
```

```yaml
uses: karpikpl/list-changed-files-action@1.1.2
```

To get a list of Python files changed in a PR:

```yaml
uses: karpikpl/list-changed-files-action@1.1.2
with:
  file-filter: '*.py'
```

## Inputs

### `file-filter`

**Optional** [Glob](https://github.com/fitzgen/glob-to-regexp) file filter to
apply on the changed files in the pull request. E.g. `*.py`. Default: no filter.

### `pull-number`

**Optional** ID of the pull request. Action will try to use pull request number
from GitHub event.

### `repo-owner`

**Optional** Another repository owner, If not set, the current repository owner
is used by default. Note that when you trying changing a repository, be aware
that `GITHUB_TOKEN` should also have permission for that repository.

### `repo-name`

**Optional** Another repository name. Of limited use on GitHub enterprise. If
not set, the current repository is used by default. Note that when you trying
changing a repository, be aware that `GITHUB_TOKEN` should also have permission
for that repository.

### `repo-token`

**Optional**, You can set
[PAT](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)
here. If not set, this will use `${{ github.token }}`.

## Outputs

### `changed_files`

Space separated list of files changed (added, modified) in the pull request that
match provided `file-filter`.

e.g. `'file1.py' 'file2.py'`

### `head_sha`

Head sha commit ID from the pull request.

### `base_sha`

Base sha commit ID from the pull request.

### `result`

The result of the action. Success, Failure or information message. Useful for
debugging.
