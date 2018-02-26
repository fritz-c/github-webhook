#!/usr/bin/env bash
#
# Tag a release, bump the version with standard-version, and push it to origin
# Usage: ./release.sh

function tryToMakeTag() {
  tries=0
  while [ "$tries" -lt 10 ]; do
    tagName="release-$(date "+%Y-%m-%d")$([ "$tries" -gt 0 ] && echo "v$(($tries+1))")"
    set +e
    git tag "$tagName" > /dev/null 2>&1
    local tag_result="$?"
    set -e
    [ "$tag_result" == "0" ] && echo "$tagName" && return
    tries=$(($tries+1))
  done

  echo "Could not find a tag name that has not been used" 1>&2
  exit 1
}

set -e

echo "Pulling from master branch"
git pull origin master --ff-only

echo "Tagging for release"
tagName="$(tryToMakeTag)"

echo "Pushing master branch and tag: ${tagName}"
git push origin master
git push --tags origin master

echo "Running standard version"
BIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
"${BIN_DIR}/../node_modules/.bin/standard-version" --message="chore(release): %s [SKIP CI]"

echo "Pushing version tag to master"
git push --follow-tags origin master
