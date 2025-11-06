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