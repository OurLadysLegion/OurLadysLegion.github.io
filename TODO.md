# TODO
- Fill out main website text.

# DONE
- Rework CAT code to make it more modular/easier to work with. (it could be better, but I am going to table this for now)

# Known Issues
- none right now

# Fixed Issues
- conns array never shrinks (!!! This one could produce a memory leak or similar issue !!!)
- minor: throwaway peer is created on every server discovery, there may be a way to fix this, but it is not a huge issue
- getAvailableIDs might have some bugs in the way it uses "splice()"
