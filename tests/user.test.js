const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)


test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Shubhadip',
        email: 'shubhadip@example.com',
        password: 'MyPass777!'
    }).expect(201)

    // Assert that the database is correctly changed
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Shubhadip',
            email: 'shubhadip@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('MyPass777!')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'invalidPassword'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set({'authorization': `Bearer ${userOne.tokens[0].token}`})
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avater image', async () => {
    await request(app)
        .post('/users/me/avater')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avater', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avater).toEqual(expect.any(Buffer))
})

test('Should update valid users fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Shubhadip De'
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('Shubhadip De')
})

test('Should not update invalid users field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Shubhadip De'
        })
        .expect(400)
})