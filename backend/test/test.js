const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app.js');

chai.use(chaiHttp);
const { expect } = chai;

describe('Auth and Expense API Tests', () => {
    let agent;

    before((done) => {
        agent = chai.request.agent(app); // Agent to maintain session between requests
        agent
            .post('/auth/register')
            .send({
                username: 'testuser4',
                email: 'testuser4@example.com',
                password: 'password123'
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(201);
                done();
            });
    });

    after((done) => {
        agent
            .post('/auth/logout')
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200);
                agent.close();
                done();
            });
    });

    it('should login the user and return the list of expenses', (done) => {
        agent
            .post('/auth/login')
            .send({
                username: 'testuser4',
                password: 'password123'
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200);
                expect(res).to.redirectTo(/\/expenses\/view/);

                agent
                    .get('/expenses/view')
                    .end((err, res) => {
                        if (err) done(err);
                        expect(res).to.have.status(200);
                        expect(res.body.expenses).to.be.an('array'); // Adjusted to match response format
                        done();
                    });
            });
    });

    it('should confirm the user is logged in', (done) => {
        agent
            .get('/auth/status')
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200);
                expect(res.body.isLoggedIn).to.be.true;
                done();
            });
    });

    it('should add a new expense', (done) => {
        agent
            .post('/expenses/add')
            .send({
                category_id: 2,
                date: '2024/08/12',
                amount: 50,
                description: 'Groceries'
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(201); // Ensure server responds with 201 Created
                done();
            });
    });

    it('should return the list of expenses', (done) => {
        agent
            .get('/expenses/view')
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200);
                expect(res.body.expenses).to.be.an('array').that.is.not.empty; // Adjusted to match response format
                done();
            });
    });

    it('should edit an existing expense', (done) => {
        agent
            .get('/expenses/view')
            .end((err, res) => {
                if (err) done(err);

                const expenses = res.body.expenses; // Adjusted to match response format
                if (expenses.length === 0) return done(new Error('No expenses found'));

                const expenseId = expenses[0].expense_id;
                agent
                    .put('/expenses/edit/')
                    .send({
                        expense_id: expenseId,
                        date: '2024/08/12',
                        category_id: 2,
                        amount: 75,
                        description: 'Updated Groceries'
                    })
                    .end((err, res) => {
                        if (err) done(err);
                        expect(res).to.have.status(200);
                        done();
                    });
            });
    });

    it('should delete an existing expense', (done) => {
        agent
            .get('/expenses/view')
            .end((err, res) => {
                if (err) done(err);

                const expenses = res.body.expenses; // Adjusted to match response format
                if (expenses.length === 0) return done(new Error('No expenses found'));

                const expenseId = expenses[0].expense_id;
                agent
                    .delete('/expenses/delete/')
                    .send({
                        expense_id: expenseId
                    })
                    .end((err, res) => {
                        if (err) done(err);
                        expect(res).to.have.status(200);
                        done();
                    });
            });
    });

    it('should add a new income', (done) =>{
        agent
            .post('/incomes/add')
            .send({
                category_id: 2,
                start_date: '2024/08/23',
                end_date: '2024/08/23',
                amount: 40000,
                description: 'Salary'
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(201); // Ensure server responds with 201 Created
                done();
            });
    });

    it('should return a list of incomes', (done) =>{
        agent
            .get('/incomes/view')
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200); // Ensure server responds with 201 Created
                expect(res.body.budgets).to.be.an('array').that.is.not.empty; // Adjusted to match response format
                done();
            });
    });

    it('should add income', (done) =>{
        agent
        .get('/incomes/view')
        .end((err, res) => {
            if (err) done(err);

            const incomes = res.body.budgets; // Adjusted to match response format
            if (incomes.length === 0) return done(new Error('No incomes found'));

            const incomeId = incomes[0].budget_id;
            agent
                .delete('/incomes/delete/')
                .send({
                    budget_id: incomeId
                })
                .end((err, res) => {
                    if (err) done(err);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
});