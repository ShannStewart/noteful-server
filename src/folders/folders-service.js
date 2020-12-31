const folderServices = {
    getAllFolders(knex) {
        return knex
        .select('*')
        .from("noteful_folders")
    },
    insertFolders(knex, newFolder) {
        return knex
        .insert(newFolder)
        .into("noteful_folders")
        .returning('*')
        .then(rows => {
            return rows[0]
          })
    },
    getById(knex, id) {
        return knex
        .from("noteful_folders")
        .select('*')
        .where('id', id)
        .first()
    },
    updateFolder(knex, id, newFolderInfo){
        return knex("noteful_folders")
        .where({ id })
        .update(newFolderInfo)
    },
    deleteFolder(knex, id){
        return knex("noteful_folders")
        .where({ id })
        .delete()
    }
}

module.exports = folderServices;