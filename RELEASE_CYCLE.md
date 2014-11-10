#### Slimmage
## Release Cycle

### Travis CI
if branch = `unstable`
  - test [local:feature, local:unit, feature, unit]
  - failure?
    - return 1
  - success?
    - compile with Google Closure
    - commit to 'bot-tested', with details
        
### Manually
- Bump version
- Merge into master
