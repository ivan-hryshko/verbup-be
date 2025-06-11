For create new migration
npm run migration:gen src/migrations/AddUsersAddIrrWords

command for copy and use
npm run migration:gen src/migrations/

Migration name example

- AddUsersAddIrrWords
- RenameNameToFullNameAtUsers
- RemoveNameAtUsers

Update db with LATEST migrations that create new tables and columns
npm run migration:up

Revert db to ONE previous migraion
npm run migration:down
