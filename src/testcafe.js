import { Selector } from 'testcafe';

fixture`Todo App Extended Tests`
    .page`https://todo.mihaelan13.dk/test/`;

const getInputField = () => Selector('#todo-input');
const getTodoForm = () => Selector('#todo-form');
const getTodoList = () => Selector('#todo-list');
const getPrioritySelect = () => Selector('#priority-select');
const getThemeToggle = () => Selector('#theme-toggle');
const getProgressText = () => Selector('.progress-text');
const getProgressFill = () => Selector('.progress-fill');
const getEmptyState = () => Selector('#empty-state');
const getFilterButton = (filter) => Selector(`[data-filter="${filter}"]`);
const getTodoItem = (text) => Selector('.todo-item').withText(text);

// Priority system tests
test('Should add todo with high priority', async t => {
    const inputField = getInputField();
    const prioritySelect = getPrioritySelect();
    const todoText = 'Urgent task';
    
    await t
        .click(prioritySelect)
        .click(prioritySelect.find('option').withText('High'))
        .typeText(inputField, todoText)
        .pressKey('enter')
        .expect(Selector('.priority-badge.priority-high').withText('High')).exists;
});

test('Should add todo with medium priority by default', async t => {
    const inputField = getInputField();
    const todoText = 'Default priority task';
    
    await t
        .typeText(inputField, todoText)
        .pressKey('enter')
        .expect(Selector('.priority-badge.priority-medium').withText('Medium')).exists;
});

test('Should add todo with low priority', async t => {
    const inputField = getInputField();
    const prioritySelect = getPrioritySelect();
    const todoText = 'Low priority task';
    
    await t
        .click(prioritySelect)
        .click(prioritySelect.find('option').withText('Low'))
        .typeText(inputField, todoText)
        .pressKey('enter')
        .expect(Selector('.priority-badge.priority-low').withText('Low')).exists;
});

test('Should sort todos by priority order', async t => {
    const inputField = getInputField();
    const prioritySelect = getPrioritySelect();
    
    // Add low priority task first
    await t
        .click(prioritySelect)
        .click(prioritySelect.find('option').withText('Low'))
        .typeText(inputField, 'Low priority task')
        .pressKey('enter');
    
    // Add high priority task second
    await t
        .click(prioritySelect)
        .click(prioritySelect.find('option').withText('High'))
        .typeText(inputField, 'High priority task')
        .pressKey('enter');
    
    const firstTodo = Selector('.todo-item').nth(0);
    await t.expect(firstTodo.find('.priority-badge.priority-high')).exists;
});

test('Should reset priority selection after adding todo', async t => {
    const inputField = getInputField();
    const prioritySelect = getPrioritySelect();
    
    await t
        .click(prioritySelect)
        .click(prioritySelect.find('option').withText('High'))
        .typeText(inputField, 'Test task')
        .pressKey('enter')
        .expect(prioritySelect.value).eql('medium');
});

// Remove todo functionality tests
test('Should remove todo item', async t => {
    const inputField = getInputField();
    const todoText = 'Task to be removed';
    
    await t
        .typeText(inputField, todoText)
        .pressKey('enter');

    const todoItem = getTodoItem(todoText);
    const removeButton = todoItem.find('.remove-btn');

    await t
        .click(removeButton)
        .expect(todoItem.exists).notOk();
});

test('Should update todo count when removing item', async t => {
    const inputField = getInputField();
    const todoList = getTodoList();
    
    await t
        .typeText(inputField, 'First task')
        .pressKey('enter')
        .typeText(inputField, 'Second task')
        .pressKey('enter');
    
    const initialCount = await todoList.find('.todo-item').count;
    const firstTodo = Selector('.todo-item').nth(0);
    
    await t
        .click(firstTodo.find('.remove-btn'))
        .expect(todoList.find('.todo-item').count).eql(initialCount - 1);
});

// Filter system tests
test('Should filter active todos only', async t => {
    const inputField = getInputField();
    
    await t
        .typeText(inputField, 'Active task')
        .pressKey('enter')
        .typeText(inputField, 'Task to complete')
        .pressKey('enter');
    
    const secondTodo = getTodoItem('Task to complete');
    await t.click(secondTodo.find('input[type="checkbox"]'));
    
    await t
        .click(getFilterButton('active'))
        .expect(Selector('.todo-item').count).eql(1)
        .expect(getTodoItem('Active task')).exists;
});

test('Should filter completed todos only', async t => {
    const inputField = getInputField();
    
    await t
        .typeText(inputField, 'Task to complete')
        .pressKey('enter')
        .typeText(inputField, 'Active task')
        .pressKey('enter');
    
    const firstTodo = getTodoItem('Task to complete');
    await t.click(firstTodo.find('input[type="checkbox"]'));
    
    await t
        .click(getFilterButton('completed'))
        .expect(Selector('.todo-item.completed').count).eql(1)
        .expect(firstTodo.hasClass('completed')).ok();
});

test('Should show all todos when all filter is selected', async t => {
    const inputField = getInputField();
    
    await t
        .typeText(inputField, 'Task 1')
        .pressKey('enter')
        .typeText(inputField, 'Task 2')
        .pressKey('enter');
    
    const firstTodo = getTodoItem('Task 1');
    await t.click(firstTodo.find('input[type="checkbox"]'));
    
    await t
        .click(getFilterButton('all'))
        .expect(Selector('.todo-item').count).eql(2);
});

test('Should update filter button counts correctly', async t => {
    const inputField = getInputField();
    
    await t
        .typeText(inputField, 'Task 1')
        .pressKey('enter')
        .typeText(inputField, 'Task 2')
        .pressKey('enter');
    
    const firstTodo = Selector('.todo-item').nth(0);
    await t.click(firstTodo.find('input[type="checkbox"]'));
    
    await t
        .expect(Selector('[data-filter="all"] .filter-count').innerText).eql('2')
        .expect(Selector('[data-filter="active"] .filter-count').innerText).eql('1')
        .expect(Selector('[data-filter="completed"] .filter-count').innerText).eql('1');
});