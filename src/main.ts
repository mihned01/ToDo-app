import './style.css'

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

let todos: Todo[] = [];

// SRP: Get DOM elements safely
const getDOMElements = () => {
  const todoInput = document.getElementById('todo-input') as HTMLInputElement;
  const todoForm = document.querySelector('.todo-form') as HTMLFormElement;
  const todoList = document.querySelector('.todo-list') as HTMLUListElement;
  
  // Debug: Check if elements exist
  if (!todoInput) console.error('todo-input not found');
  if (!todoForm) console.error('todo-form not found');
  if (!todoList) console.error('todo-list not found');
  
  return { todoInput, todoForm, todoList };
};

const { todoInput, todoForm, todoList } = getDOMElements();

// SRP: Create progress bar HTML structure
const createProgressBarHTML = (): string => {
  return `
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <span class="progress-text">0% completed</span>
  `;
};

// SRP: Insert progress bar into DOM
const insertProgressBar = (): void => {
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';
  progressContainer.innerHTML = createProgressBarHTML();
  
  // Insert after the form
  if (todoForm && todoForm.parentNode) {
    todoForm.parentNode.insertBefore(progressContainer, todoForm.nextSibling);
  }
};

// SRP: Get progress bar elements
const getProgressElements = () => {
  const progressFill = document.querySelector('.progress-fill') as HTMLDivElement;
  const progressText = document.querySelector('.progress-text') as HTMLSpanElement;
  
  if (!progressFill) console.error('progress-fill not found');
  if (!progressText) console.error('progress-text not found');
  
  return { progressFill, progressText };
};

// Initialize progress bar
insertProgressBar();
const { progressFill, progressText } = getProgressElements();

// SRP: Create a new todo object
const createTodo = (text: string): Todo => {
  return {
    id: Date.now(),
    text: text.trim(),
    completed: false
  };
};

// SRP: Add todo to array
const addTodoToArray = (todo: Todo): void => {
  todos.push(todo);
  console.log('Todo added:', todo);
  console.log('Current todos:', todos);
};

// SRP: Calculate progress percentage
const calculateProgress = (): number => {
  if (todos.length === 0) return 0;
  const completedCount = todos.filter(todo => todo.completed).length;
  return Math.round((completedCount / todos.length) * 100);
};

// SRP: Get completed count
const getCompletedCount = (): number => {
  return todos.filter(todo => todo.completed).length;
};

// SRP: Update progress bar visual
const updateProgressVisual = (percentage: number): void => {
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
};

// SRP: Update progress text
const updateProgressText = (percentage: number, completed: number, total: number): void => {
  if (progressText) {
    progressText.textContent = `${percentage}% completed (${completed}/${total})`;
  }
};

// SRP: Update entire progress display
const updateProgressDisplay = (): void => {
  const percentage = calculateProgress();
  const completed = getCompletedCount();
  const total = todos.length;
  
  updateProgressVisual(percentage);
  updateProgressText(percentage, completed, total);
};

// SRP: Find todo by ID
const findTodoById = (id: number): Todo | undefined => {
  return todos.find(todo => todo.id === id);
};

// SRP: Toggle todo completion
const toggleTodoCompletion = (todo: Todo): void => {
  todo.completed = !todo.completed;
};

// SRP: Toggle todo by ID
const toggleTodo = (id: number): void => {
  const todo = findTodoById(id);
  if (todo) {
    toggleTodoCompletion(todo);
    console.log('Todo toggled:', todo);
  }
};

// SRP: Remove todo from array
const removeTodoFromArray = (id: number): void => {
  const initialLength = todos.length;
  todos = todos.filter(todo => todo.id !== id);
  console.log(`Removed todo. Count: ${initialLength} -> ${todos.length}`);
};

// SRP: Clear input field
const clearInput = (): void => {
  if (todoInput) {
    todoInput.value = '';
  }
};

// SRP: Create checkbox element
const createCheckboxElement = (todo: Todo): string => {
  return `<input type="checkbox" ${todo.completed ? 'checked' : ''}>`;
};

// SRP: Create todo text element
const createTodoTextElement = (todo: Todo): string => {
  return `<span>${todo.text}</span>`;
};

// SRP: Create remove button element
const createRemoveButtonElement = (): string => {
  return `<button class="remove-btn">Remove</button>`;
};

// SRP: Create todo item HTML
const createTodoItemHTML = (todo: Todo): string => {
  return `
    ${createCheckboxElement(todo)}
    ${createTodoTextElement(todo)}
    ${createRemoveButtonElement()}
  `;
};

// SRP: Create todo DOM element
const createTodoElement = (todo: Todo): HTMLLIElement => {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  li.innerHTML = createTodoItemHTML(todo);
  return li;
};

// SRP: Handle checkbox change
const handleCheckboxChange = (todoId: number): void => {
  toggleTodo(todoId);
  renderTodos();
  updateProgressDisplay();
};

// SRP: Handle remove button click
const handleRemoveClick = (todoId: number): void => {
  removeTodoFromArray(todoId);
  renderTodos();
  updateProgressDisplay();
};

// SRP: Add event listeners to todo element
const addTodoEventListeners = (li: HTMLLIElement, todoId: number): void => {
  const checkbox = li.querySelector('input[type="checkbox"]') as HTMLInputElement;
  const removeButton = li.querySelector('.remove-btn') as HTMLButtonElement;
  
  if (checkbox) {
    checkbox.addEventListener('change', () => handleCheckboxChange(todoId));
  }
  
  if (removeButton) {
    removeButton.addEventListener('click', () => handleRemoveClick(todoId));
  }
};

// SRP: Clear todo list
const clearTodoList = (): void => {
  if (todoList) {
    todoList.innerHTML = '';
  }
};

// SRP: Append todo to list
const appendTodoToList = (todoElement: HTMLLIElement): void => {
  if (todoList) {
    todoList.appendChild(todoElement);
  }
};

// SRP: Render all todos
const renderTodos = (): void => {
  clearTodoList();
  
  todos.forEach((todo) => {
    const li = createTodoElement(todo);
    addTodoEventListeners(li, todo.id);
    appendTodoToList(li);
  });
  
  console.log('Rendered todos:', todos.length);
};

// SRP: Handle complete todo addition process
const addTodo = (text: string): void => {
  const newTodo = createTodo(text);
  addTodoToArray(newTodo);
  renderTodos();
  updateProgressDisplay();
  clearInput();
};

// SRP: Validate input text
const isValidInput = (text: string): boolean => {
  return text.trim() !== '';
};

// SRP: Handle form submission
const handleFormSubmit = (event: Event): void => {
  event.preventDefault();
  
  if (!todoInput) {
    console.error('Input element not found');
    return;
  }
  
  const text = todoInput.value.trim();
  console.log('Form submitted with text:', text);
  
  if (isValidInput(text)) {
    addTodo(text);
  } else {
    console.log('Invalid input');
  }
};

// SRP: Initialize event listeners
const initializeEventListeners = (): void => {
  if (todoForm) {
    todoForm.addEventListener('submit', handleFormSubmit);
    console.log('Form event listener added');
  } else {
    console.error('Cannot add event listener: form not found');
  }
};

// SRP: Initialize application
const initializeApp = (): void => {
  console.log('Initializing app...');
  initializeEventListeners();
  renderTodos();
  updateProgressDisplay();
  console.log('App initialized');
};

// Start the application
initializeApp();


const createThemeToggleHTML = (): string => {
  return '🌙';
};

// SRP: Create theme toggle button element
const createThemeToggleButton = (): HTMLButtonElement => {
  const button = document.createElement('button');
  button.className = 'theme-toggle';
  button.innerHTML = createThemeToggleHTML();
  button.setAttribute('aria-label', 'Toggle dark mode');
  return button;
};

// SRP: Insert theme toggle button into DOM
const insertThemeToggleButton = (): HTMLButtonElement => {
  const toggleButton = createThemeToggleButton();
  document.body.appendChild(toggleButton);
  return toggleButton;
};

// SRP: Check if dark mode is enabled
const isDarkModeEnabled = (): boolean => {
  return document.body.classList.contains('dark-mode');
};

// SRP: Get stored theme preference
const getStoredTheme = (): string | null => {
  return localStorage.getItem('theme');
};

// SRP: Store theme preference
const storeTheme = (theme: string): void => {
  localStorage.setItem('theme', theme);
};

// SRP: Apply dark mode
const applyDarkMode = (): void => {
  document.body.classList.add('dark-mode');
};

// SRP: Apply light mode
const applyLightMode = (): void => {
  document.body.classList.remove('dark-mode');
};

const updateToggleButtonIcon = (button: HTMLButtonElement): void => {
  if (isDarkModeEnabled()) {
    button.innerHTML = '☀️';
    button.setAttribute('aria-label', 'Toggle light mode');
  } else {
    button.innerHTML = '🌙';
    button.setAttribute('aria-label', 'Toggle dark mode');
  }
};

// SRP: Toggle theme mode
const toggleTheme = (button: HTMLButtonElement): void => {
  if (isDarkModeEnabled()) {
    applyLightMode();
    storeTheme('light');
  } else {
    applyDarkMode();
    storeTheme('dark');
  }
  updateToggleButtonIcon(button);
};

// SRP: Apply stored theme on load
const applyStoredTheme = (): void => {
  const storedTheme = getStoredTheme();
  if (storedTheme === 'dark') {
    applyDarkMode();
  } else {
    applyLightMode();
  }
};

// SRP: Handle theme toggle button click
const handleThemeToggleClick = (button: HTMLButtonElement): void => {
  toggleTheme(button);
};

// SRP: Add event listener to theme toggle button
const addThemeToggleEventListener = (button: HTMLButtonElement): void => {
  button.addEventListener('click', () => handleThemeToggleClick(button));
};

// SRP: Initialize theme toggle functionality
const initializeThemeToggle = (): void => {
  applyStoredTheme();
  const toggleButton = insertThemeToggleButton();
  updateToggleButtonIcon(toggleButton);
  addThemeToggleEventListener(toggleButton);
  console.log('Theme toggle initialized');
};

initializeThemeToggle();