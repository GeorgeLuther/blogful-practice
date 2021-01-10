const ArticlesService = {
    getAllArticles(db){
        return db('blogful_articles').select('*');
    },
    insertArticle(db, article){
        return db('blogful_articles')
                  .insert(article)
                  .returning('*')
                  .then(rows => rows[0])
    },
    getById(db, id){
        return db('blogful_articles')
                .select('*')
                .where('id', id)
                .first()
    },
    deleteArticle(db,id){
        return db('blogful_articles')
                .where({id})
                .delete()
    },
    updateArticle(db, id, newData){
        return db('blogful_articles')
                .where({id})
                .update(newData)
    }
}
module.exports = ArticlesService