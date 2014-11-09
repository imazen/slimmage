#### Slimmage testing
## Notes

### Specific to me
I recently migrated to linux(mint 17) from Windows
Npm Issue:
  ERROR: '...spawn EACCES...' 
  An issue that is npm/node specific, but caused headaches none-the-less.
  npm gets installed through apt-get, using sudo (root).
  This screws up permissions for running executables.
  To get around this, I installed *nvm*, the node version manager
  Changed ownership of ~/.npm folder 
  uninstalled phantomjs globally (which I had tried as a solution)
  ran `nvm install 0.10.33`
  ran `nvm alias default 0.10.33`
  reloaded the terminal (nvm sources a script file in .bashrc)
  ran `npm install` without sudo
  ...Things are working thus far.
  There is probably an elegant solution to this, but my Google search terms did not find it.
