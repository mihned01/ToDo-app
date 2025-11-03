import { Selector } from 'testcafe';

fixture`Todo App Tests`
    .page`http://localhost:3000`; 

test('Should add new todo item', async t => {
    const inputField = Selector('input[type="text"]');
    const addButton = Selector('button').withText('Add');
    const todoList = Selector('.todo-list');
    const newTodoText = 'Buy groceries';

    await t
        .typeText(inputField, newTodoText)
        .click(addButton)
        .expect(todoList.innerText).contains(newTodoText);
});




test('Should mark todo item as complete', async t => {
    const inputField = Selector('input[type="text"]');
    const addButton = Selector('button').withText('Add');
    const todoText = 'Walk the dog';
    
    await t
        .typeText(inputField, todoText)
        .click(addButton);

    const todoItem = Selector('.todo-item').withText(todoText);
    const checkbox = todoItem.find('input[type="checkbox"]');

    await t
        .click(checkbox)
        .expect(todoItem.hasClass('completed')).ok();
});