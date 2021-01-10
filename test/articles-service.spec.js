
const { expect } = require('chai')
const knex = require('knex')

const ArticlesService = require("../src/articles-service")

const testArticles = [
    {
        id: 1,
        title: 'blog 1',
        content: 'this is some content',
        date_published: new Date('2021-01-07T15:59:41.510Z')
    },
    {
        id: 2,
        title: 'blog 2',
        content: 'this is some content',
        date_published: new Date('2021-01-06T15:59:41.510Z')
    },
    {
        id: 3,
        title: 'blog 3',
        content: 'this is some content',
        date_published: new Date('2021-01-05T15:59:41.510Z')
    }
]

describe('Articles Service', ()=>{
    //Handle database state
    let db   
    before('setup db', ()=>{
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })
    before('clean db tables',()=>{
        return db('blogful_articles').truncate()
    })
    afterEach('clean db tables',()=>{
        return db('blogful_articles').truncate()
    })
    after('destroy conn',()=>{
        return db.destroy()
    })


    describe('getAllArticles function', ()=>{
        it('should return empty array when database is empty',()=>{
            return ArticlesService.getAllArticles(db)
                .then(actualData => expect(actualData).to.eql([]))
        })
        context('when db is populated',()=>{
            beforeEach('insert data',()=>{
                return db('blogful_articles')
                    .insert(testArticles)
            })
            it('should return all articles',()=>{
               return ArticlesService.getAllArticles(db)
                     .then(actualData=> expect(actualData).to.eql(testArticles))
            })
        })
    })

    describe('insertArticle()', ()=>{
        it('should return new article when valid data provided',()=>{
            const inputArticle = {
                title: 'test blog 1',
                content: 'test content',
                date_published: new Date('2021-01-05T15:59:41.510Z')
            }
            return ArticlesService.insertArticle(db, inputArticle)
                .then(newArticle => {
                    expect(newArticle).to.be.an('object')
                    expect(newArticle.id).to.exist
                    expect(newArticle.title).to.eql(inputArticle.title)
                    expect(newArticle.content).to.eql(inputArticle.content)
                    expect(newArticle.date_published).to.eql(inputArticle.date_published)
                    return db('blogful_articles')
                        .select('*')
                        .where({id: newArticle.id})
                        .first()
                        .then(article => expect(article).to.exist)
                })
        })
    })

    context('Given blogful_articles has data',()=>{
        beforeEach(()=>{
            return db('blogful_articles')
                .insert(testArticles)
        })

        it(`getById() resolves an article by id from 'blogful_articles'`,()=>{
            const thirdId = 3
            const thirdTestArticle = testArticles[thirdId - 1]
            return ArticlesService.getById(db, thirdId)
                    .then(actual => {
                        expect(actual).to.eql({
                            id: thirdId,
                            title: thirdTestArticle.title,
                            content: thirdTestArticle.content,
                            date_published: thirdTestArticle.date_published,
                        })
                    })
        })

        it(`deleteArticle() removes and article by id from 'blogful_articles`,()=>{
            const articleId = 3
            return ArticlesService.deleteArticle(db, articleId)
                    .then(()=> ArticlesService.getAllArticles(db))
                    .then((allArticles)=>{
                        const expected = testArticles.filter(article => article.id !== articleId)
                        expect(allArticles).to.eql(expected)
                    })
        })

        it(`updateArticle() updates data in an article from 'blogful_articles`,()=>{
            const idOfArticleToUpdate=3
            const newArticleData = {
                title: 'updated title',
                content: 'updated content',
                date_published: new Date(),
            }
            return ArticlesService.updateArticle(db, idOfArticleToUpdate, newArticleData)
                    .then(()=> ArticlesService.getById(db, idOfArticleToUpdate))
                    .then(article => {
                        expect(article).to.eql({
                            id: idOfArticleToUpdate,
                            ...newArticleData,
                        })
                    })
        })
    })
})