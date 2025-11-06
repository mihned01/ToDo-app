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

test('Should highlight active filter button', async t => {
    await t
        .expect(getFilterButton('all').hasClass('active')).ok()
        .click(getFilterButton('active'))
        .expect(getFilterButton('active').hasClass('active')).ok()
        .expect(getFilterButton('all').hasClass('active')).notOk();
});

// Progress tracking tests
test('Should show zero progress when no todos exist', async t => {
    const progressText = getProgressText();
    await t.expect(progressText.innerText).contains('0%');
});

test('Should update progress when todos are completed', async t => {
    const inputField = getInputField();
    const progressText = getProgressText();
    
    await t
        .typeText(inputField, 'Task 1')
        .pressKey('enter')
        .typeText(inputField, 'Task 2')
        .pressKey('enter');
    
    const firstTodo = Selector('.todo-item').nth(0);
    await t
        .click(firstTodo.find('input[type="checkbox"]'))
        .expect(progressText.innerText).contains('50%');
});

test('Should show 100% progress when all todos are completed', async t => {
    const inputField = getInputField();
    const progressText = getProgressText();
    
    await t
        .typeText(inputField, 'Single task')
        .pressKey('enter');
    
    const todoItem = Selector('.todo-item');
    await t
        .click(todoItem.find('input[type="checkbox"]'))
        .expect(progressText.innerText).contains('100%');
});

test('Should update progress bar visual width', async t => {
    const inputField = getInputField();
    const progressFill = getProgressFill();
    
    await t
        .typeText(inputField, 'Test task')
        .pressKey('enter');
    
    const todoItem = Selector('.todo-item');
    await t
        .click(todoItem.find('input[type="checkbox"]'))
        .expect(progressFill.getStyleProperty('width')).eql('100%');
});

// Theme toggle tests
test('Should toggle to dark mode', async t => {
    const themeToggle = getThemeToggle();
    const body = Selector('body');
    
    await t
        .click(themeToggle)
        .expect(body.hasClass('dark-mode')).ok();
});

test('Should toggle back to light mode', async t => {
    const themeToggle = getThemeToggle();
    const body = Selector('body');
    
    await t
        .click(themeToggle)
        .click(themeToggle)
        .expect(body.hasClass('dark-mode')).notOk();
});

test('Should update theme toggle icon text', async t => {
    const themeToggle = getThemeToggle();
    
    await t
        .expect(themeToggle.innerText).eql('🌙')
        .click(themeToggle)
        .expect(themeToggle.innerText).eql('☀️');
});

// Input validation tests
test('Should not add empty todo', async t => {
    const inputField = getInputField();
    const todoList = getTodoList();
    const initialCount = await todoList.find('.todo-item').count;
    
    await t
        .typeText(inputField, '   ')
        .pressKey('enter')
        .expect(todoList.find('.todo-item').count).eql(initialCount);
});

test('Should not add todo with only whitespace', async t => {
    const inputField = getInputField();
    const todoList = getTodoList();
    const initialCount = await todoList.find('.todo-item').count;
    
    await t
        .typeText(inputField, '\t\n  ')
        .pressKey('enter')
        .expect(todoList.find('.todo-item').count).eql(initialCount);
});

test('Should clear input field after adding todo', async t => {
    const inputField = getInputField();
    
    await t
        .typeText(inputField, 'Test task')
        .pressKey('enter')
        .expect(inputField.value).eql('');
});

test('Should trim whitespace from todo text', async t => {
    const inputField = getInputField();
    const todoText = '  Trimmed task  ';
    
    await t
        .typeText(inputField, todoText)
        .pressKey('enter')
        .expect(getTodoItem('Trimmed task')).exists;
});

// Empty state tests
test('Should show empty state when no todos exist', async t => {
    const emptyState = getEmptyState();
    await t
        .expect(emptyState.visible).ok()
        .expect(emptyState.innerText).contains('No todos yet!');
});

test('Should hide empty state when todos are added', async t => {
    const inputField = getInputField();
    const emptyState = getEmptyState();
    
    await t
        .typeText(inputField, 'First task')
        .pressKey('enter')
        .expect(emptyState.visible).notOk();
});

test('Should show empty state for active filter when all tasks completed', async t => {
    const inputField = getInputField();
    const emptyState = getEmptyState();
    
    await t
        .typeText(inputField, 'Task to complete')
        .pressKey('enter');
    
    const todoItem = Selector('.todo-item');
    await t
        .click(todoItem.find('input[type="checkbox"]'))
        .click(getFilterButton('active'))
        .expect(emptyState.visible).ok()
        .expect(emptyState.innerText).contains('All tasks completed!');
});

test('Should show empty state for completed filter when no tasks completed', async t => {
    const inputField = getInputField();
    const emptyState = getEmptyState();
    
    await t
        .typeText(inputField, 'Active task')
        .pressKey('enter')
        .click(getFilterButton('completed'))
        .expect(emptyState.visible).ok()
        .expect(emptyState.innerText).contains('No completed tasks yet!');
});

// Form submission tests
test('Should submit form with Enter key', async t => {
    const inputField = getInputField();
    const todoText = 'Enter key test';
    
    await t
        .typeText(inputField, todoText)
        .pressKey('enter')
        .expect(getTodoItem(todoText)).exists;
});

test('Should prevent form submission with empty input', async t => {
    const inputField = getInputField();
    const todoList = getTodoList();
    const initialCount = await todoList.find('.todo-item').count;
    
    await t
        .click(inputField)
        .pressKey('enter')
        .expect(todoList.find('.todo-item').count).eql(initialCount);
});

// Accessibility tests
test('Should have proper ARIA attributes on filter buttons', async t => {
    await t
        .expect(getFilterButton('all').getAttribute('aria-pressed')).eql('true')
        .click(getFilterButton('active'))
        .expect(getFilterButton('active').getAttribute('aria-pressed')).eql('true')
        .expect(getFilterButton('all').getAttribute('aria-pressed')).eql('false');
});

test('Should have proper titles on filter buttons', async t => {
    await t
        .expect(getFilterButton('all').getAttribute('title')).contains('Show all todos')
        .expect(getFilterButton('active').getAttribute('title')).contains('Show active todos')
        .expect(getFilterButton('completed').getAttribute('title')).contains('Show completed todos');
});

// Multiple todos interaction tests
test('Should handle multiple todos with different priorities', async t => {
    const inputField = getInputField();
    const prioritySelect = getPrioritySelect();
    
    // Add high priority
    await t
        .click(prioritySelect)
        .click(prioritySelect.find('option').withText('High'))
        .typeText(inputField, 'High priority')
        .pressKey('enter');
    
    // Add low priority
    await t
        .click(prioritySelect)
        .click(prioritySelect.find('option').withText('Low'))
        .typeText(inputField, 'Low priority')
        .pressKey('enter');
    
    // Add medium priority
    await t
        .typeText(inputField, 'Medium priority')
        .pressKey('enter');
    
    const todoItems = Selector('.todo-item');
    await t
        .expect(todoItems.count).eql(3)
        .expect(todoItems.nth(0).find('.priority-high')).exists
        .expect(todoItems.nth(1).find('.priority-medium')).exists
        .expect(todoItems.nth(2).find('.priority-low')).exists;
});

test('Should maintain filter state when adding new todos', async t => {
    const inputField = getInputField();
    
    await t
        .typeText(inputField, 'First task')
        .pressKey('enter')
        .click(getFilterButton('active'))
        .typeText(inputField, 'Second task')
        .pressKey('enter')
        .expect(Selector('.todo-item').count).eql(2)
        .expect(getFilterButton('active').hasClass('active')).ok();
});
