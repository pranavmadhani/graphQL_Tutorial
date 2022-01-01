const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const {GraphQLSchema, GraphQLObjectType,GraphQLString,GraphQLList,GraphQLNonNull, GraphQLInt} = require('graphql');
const app = express();
//sample data
const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

// Book Type
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLString) },
        author:{
            type:AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }

})
});

//Author Type
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an author of a book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {type: GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }}
    })
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addAuthor: {
            type: AuthorType,
            description: 'Add a new author',
            args: {
                name: { 
                    type: GraphQLNonNull(GraphQLString),
                    description: 'Name of the author'
             },
             
            },
            resolve: (parent, args) => {
                const author = {id:authors.length + 1, name: args.name};
                authors.push(author);
                return author;
            }
        },
        addBook: {
            type: BookType,
            description: 'Add a new book',
            args: {
                name: { 
                    type: GraphQLNonNull(GraphQLString),
                    description: 'Name of the Book'
             },
                authorId: {
                    type: GraphQLNonNull(GraphQLInt),
                    description: 'Author ID'
             
            }
            },
            resolve: (parent, args) => {
                const book = {id:books.length + 1, name: args.name,authorId: args.authorId};
                books.push(book);
                return book;
            }
        }
    })
    })
        
        
    
   

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: {    
         book: {
        type: (BookType),
        description: 'returns a single book',
        args: {
        id: { type: GraphQLInt }

        },
        resolve: (parent, args) => {
            return books.find(book => book.id === args.id)
        }
       
    },
    author: {
        type: (AuthorType),
        description: 'Single author',
        args: {
            id: { type: GraphQLInt }
        },
        resolve: (parent, args) => {
            return authors.find(author => author.id === args.id)
        }
    }
     ,  
        books: {
            type: GraphQLList(BookType),
            description: 'List of books',
            resolve: () => books
           
        },
        authors: {
            type: GraphQLList(AuthorType),
            description: 'List of authors',
            resolve: () => authors
        }
    }
});
        

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
}); 

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));
app.listen(3000, () => console.log('Server started on port 3000'));
