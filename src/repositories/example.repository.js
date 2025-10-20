import { Expense } from '../models/expense.model.js';
import Chance from 'chance';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

const chance = new Chance();

const DEFAULT_ACCOUNT = 'TODO';

class ExpenseRepository {
    create(expense, idAccount = DEFAULT_ACCOUNT) {
        expense.account = idAccount;
        return Expense.create(expense);
    }

    retrieveAll() {
        return Expense.find().sort({ date: -1 }).populate('account', 'base64');
    }

    retrieveForOneUser(idAccount) {
        return Expense.find({account: idAccount});
    }

    transform(expense) {
        expense.href = `${process.env.BASE_URL}/expenses/${expense.base64}`;

        expense.account = {
            href: `${process.env.BASE_URL}/accounts/${expense.account.base64}`
        };

        delete expense.base64;
        delete expense._id;
        delete expense.__v;

        return expense;
    }

    generate() {
        const generatedExpense = {
            date: faker.date.between({ from: '2024-01-01', to: dayjs() }),
            description: chance.sentence({ words: 3 }),
            category: chance.pickone([
                'Logement 🏠',
                'Alimentation 🍎',
                'Loisirs & Divertissements 🎬',
                'Épargne & Investissements 💰',
                'Déplacements 🚗',
                'Santé & Bien-être 💊'
            ]),
            amount: chance.floating({ min: 10, max: 1000, fixed: 2 })
        };

        this.create(generatedExpense);
    }
}

export default new ExpenseRepository();
