# Exit on first error...
set -e

# Environment...
# globals: $TRAVIS_BRANCH, $GH_TOKEN $TRAVIS_BUILD_NUMBER
# Travis has pulled and checked out the branch we commited (that was also whitelisted)

REPO=https://ponelat:$GH_TOKEN@github.com/ponelat/test.git

INCOMING_BR=unstable
OUT_BR=bot_tested

# Give ourselves an identity
git config --global user.email "travis@example.com"
git config --global user.name "Travis CI Worker"

# Delete  branch on repo, silently
git push $REPO --delete $OUT_BR -q 2> /dev/null

# Do something...
# Add files
git add slimmage.min.js

# Recreate OUT branch
git checkout -b $OUT_BR

# Commit
git commit -m 'Travis tested #'+"$TRAVIS_BUILD_NUMBER"

# Push it back to repo
git push -u $REPO $OUT_BR -q 2> /dev/null

echo "Have a nice day!"
