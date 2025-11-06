import './style.css'

type Priority = 'low' | 'medium' | 'high';
type FilterStatus = 'all' | 'active' | 'completed';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
}

interface PriorityConfig {
  label: string;
  value: Priority;
  color: string;
  order: number;
}

let todos: Todo[] = [];
let currentFilter: FilterStatus = 'all';

const getPriorityOptions = (): PriorityConfig[] => {
  return [
    { label: 'High', value: 'high', color: '#ff6b8a', order: 3 },
    { label: 'Medium', value: 'medium', color: '#ffd54f', order: 2 },
    { label: 'Low', value: 'low', color: '#66d9a5', order: 1 }
  ];
};

const getDOMElements = () => {
  const todoInput = document.getElementById('todo-input') as HTMLInputElement;
  const todoForm = document.getElementById('todo-form') as HTMLFormElement;
  const todoList = document.getElementById('todo-list') as HTMLUListElement;
  const prioritySelect = document.getElementById('priority-select') as HTMLSelectElement;
  const progressFill = document.querySelector('.progress-fill') as HTMLDivElement;
  const progressText = document.querySelector('.progress-text') as HTMLSpanElement;
  const emptyState = document.getElementById('empty-state') as HTMLLIElement;
  const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
  
  return {
    todoInput,
    todoForm,
    todoList,
    prioritySelect,
    progressFill,
    progressText,
    emptyState,
    themeToggle
  };
};

let elements: ReturnType<typeof getDOMElements>;

const initializeDOMReferences = (): void => {
  elements = getDOMElements();
  
  const requiredElements = [
    'todoInput', 'todoForm', 'todoList', 'prioritySelect',
    'progressFill', 'progressText', 'emptyState', 'themeToggle'
  ];
  
  requiredElements.forEach(elementName => {
    if (!elements[elementName as keyof typeof elements]) {
      console.error(`Required element not found: ${elementName}`);
    }
  });
};

const getPriorityConfig = (priority: Priority): PriorityConfig => {
  const options = getPriorityOptions();
  return options.find(option => option.value === priority) || options[1];
};

const getSelectedPriority = (): Priority => {
  return (elements.prioritySelect?.value as Priority) || 'medium';
};

const resetPrioritySelection = (): void => {
  if (elements.prioritySelect) {
    elements.prioritySelect.value = 'medium';
  }
};

const createPriorityBadge = (priority: Priority): string => {
  const config = getPriorityConfig(priority);
  return `
    <span class="priority-badge priority-${priority}" 
          style="background-color: ${config.color}"
          title="${config.label} Priority">
      ${config.label}
    </span>
  `;
};

const sortTodosByPriority = (todos: Todo[]): Todo[] => {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const configA = getPriorityConfig(a.priority);
    const configB = getPriorityConfig(b.priority);
    return configB.order - configA.order;
  });
};

const createTodo = (text: string, priority: Priority = 'medium'): Todo => {
  return {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    priority: priority
  };
};

const addTodoToArray = (todo: Todo): void => {
  todos.push(todo);
  console.log('Todo added:', todo);
};

const findTodoById = (id: number): Todo | undefined => {
  return todos.find(todo => todo.id === id);
};

const removeTodoFromArray = (id: number): void => {
  const initialLength = todos.length;
  todos = todos.filter(todo => todo.id !== id);
  console.log(`Removed todo. Count: ${initialLength} -> ${todos.length}`);
};

const toggleTodoCompletion = (todo: Todo): void => {
  todo.completed = !todo.completed;
};

const toggleTodo = (id: number): void => {
  const todo = findTodoById(id);
  if (todo) {
    toggleTodoCompletion(todo);
    console.log('Todo toggled:', todo);
  }
};

const calculateProgress = (): number => {
  if (todos.length === 0) return 0;
  const completedCount = todos.filter(todo => todo.completed).length;
  return Math.round((completedCount / todos.length) * 100);
};

const getCompletedCount = (): number => {
  return todos.filter(todo => todo.completed).length;
};

const updateProgressVisual = (percentage: number): void => {
  if (elements.progressFill) {
    elements.progressFill.style.width = `${percentage}%`;
  }
};

const updateProgressText = (percentage: number, completed: number, total: number): void => {
  if (elements.progressText) {
    elements.progressText.textContent = `${percentage}% completed (${completed}/${total})`;
  }
};

const updateProgressDisplay = (): void => {
  const percentage = calculateProgress();
  const completed = getCompletedCount();
  const total = todos.length;
  
  updateProgressVisual(percentage);
  updateProgressText(percentage, completed, total);
  FilterSystem.refresh(); 
};

const clearInput = (): void => {
  if (elements.todoInput) {
    elements.todoInput.value = '';
  }
};

const createCheckboxElement = (todo: Todo): string => {
  return `<input type="checkbox" ${todo.completed ? 'checked' : ''}>`;
};

const createTodoTextElement = (todo: Todo): string => {
  return `<span class="todo-text">${todo.text}</span>`;
};

const createRemoveButtonElement = (): string => {
  return `<button class="remove-btn">Remove</button>`;
};

const createTodoItemHTML = (todo: Todo): string => {
  return `
    ${createCheckboxElement(todo)}
    ${createTodoTextElement(todo)}
    ${createPriorityBadge(todo.priority)}
    ${createRemoveButtonElement()}
  `;
};

const createTodoElement = (todo: Todo): HTMLLIElement => {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  li.innerHTML = createTodoItemHTML(todo);
  li.setAttribute('data-todo-id', todo.id.toString());
  return li;
};

const handleCheckboxChange = (todoId: number): void => {
  toggleTodo(todoId);
  renderFilteredTodos();
  updateProgressDisplay();
};

const handleRemoveClick = (todoId: number): void => {
  removeTodoFromArray(todoId);
  renderFilteredTodos();
  updateProgressDisplay();
};

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

const clearTodoList = (): void => {
  if (elements.todoList) {
    const todoItems = elements.todoList.querySelectorAll('.todo-item');
    todoItems.forEach(item => item.remove());
  }
};

const appendTodoToList = (todoElement: HTMLLIElement): void => {
  if (elements.todoList) {
    elements.todoList.appendChild(todoElement);
  }
};

const showEmptyState = (): void => {
  if (elements.emptyState) {
    elements.emptyState.style.display = 'block';
  }
};

const hideEmptyState = (): void => {
  if (elements.emptyState) {
    elements.emptyState.style.display = 'none';
  }
};

const isTodosListEmpty = (): boolean => {
  return todos.length === 0;
};

const addTodo = (text: string): void => {
  const priority = getSelectedPriority();
  const newTodo = createTodo(text, priority);
  addTodoToArray(newTodo);
  renderFilteredTodos();
  updateProgressDisplay();
  clearInput();
  resetPrioritySelection();
};

// Input validation 
const isValidInput = (text: string): boolean => {
  return text.trim() !== '';
};

// Form submit handling 
const handleFormSubmit = (event: Event): void => {
  event.preventDefault();
  
  if (!elements.todoInput) {
    console.error('Input element not found');
    return;
  }
  
  const text = elements.todoInput.value.trim();
  console.log('Form submitted with text:', text);
  
  if (isValidInput(text)) {
    addTodo(text);
  } else {
    console.log('Invalid input');
  }
};

const initializeFormEventListeners = (): void => {
  if (elements.todoForm) {
    elements.todoForm.addEventListener('submit', handleFormSubmit);
    console.log('Form event listener added');
  } else {
    console.error('Cannot add event listener: form not found');
  }
};

const isDarkModeEnabled = (): boolean => {
  return document.body.classList.contains('dark-mode');
};

const getStoredTheme = (): string | null => {
  return localStorage.getItem('theme');
};

const storeTheme = (theme: string): void => {
  localStorage.setItem('theme', theme);
};

const applyDarkMode = (): void => {
  document.body.classList.add('dark-mode');
};

const applyLightMode = (): void => {
  document.body.classList.remove('dark-mode');
};

const updateThemeToggleIcon = (): void => {
  if (!elements.themeToggle) return;
  
  if (isDarkModeEnabled()) {
    elements.themeToggle.innerHTML = '☀️';
    elements.themeToggle.setAttribute('aria-label', 'Toggle light mode');
  } else {
    elements.themeToggle.innerHTML = '🌙';
    elements.themeToggle.setAttribute('aria-label', 'Toggle dark mode');
  }
};

const toggleTheme = (): void => {
  if (isDarkModeEnabled()) {
    applyLightMode();
    storeTheme('light');
  } else {
    applyDarkMode();
    storeTheme('dark');
  }
  updateThemeToggleIcon();
};

// Stored theme application 
const applyStoredTheme = (): void => {
  const storedTheme = getStoredTheme();
  if (storedTheme === 'dark') {
    applyDarkMode();
  } else {
    applyLightMode();
  }
};

const handleThemeToggleClick = (): void => {
  toggleTheme();
};

const initializeThemeEventListeners = (): void => {
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener('click', handleThemeToggleClick);
    console.log('Theme toggle event listener added');
  } else {
    console.error('Cannot add event listener: theme toggle not found');
  }
};

const initializeThemeSystem = (): void => {
  applyStoredTheme();
  updateThemeToggleIcon();
  initializeThemeEventListeners();
  console.log('Theme system initialized');
};

// ==========  FILTER SYSTEM  ==========

const filterTodosByStatus = (todos: Todo[], status: FilterStatus): Todo[] => {
  switch (status) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    case 'all':
    default:
      return todos;
  }
};

const getCurrentFilter = (): FilterStatus => {
  return currentFilter;
};

const setCurrentFilter = (status: FilterStatus): void => {
  currentFilter = status;
  console.log('Filter changed to:', status);
};

const getActiveTodoCount = (): number => {
  return todos.filter(todo => !todo.completed).length;
};

const getFilteredTodoCount = (status: FilterStatus): number => {
  return filterTodosByStatus(todos, status).length;
};

const shouldShowEmptyStateForFilter = (status: FilterStatus): boolean => {
  return getFilteredTodoCount(status) === 0;
};

const createFilterButtonElement = (status: FilterStatus, label: string, count: number): HTMLButtonElement => {
  const button = document.createElement('button');
  const isActive = getCurrentFilter() === status;
  
  button.className = `filter-btn ${isActive ? 'active' : ''}`;
  button.setAttribute('data-filter', status);
  button.setAttribute('aria-pressed', isActive.toString());
  button.setAttribute('title', `Show ${label.toLowerCase()} todos`);
  
  const labelSpan = document.createElement('span');
  labelSpan.textContent = label;
  
  const countSpan = document.createElement('span');
  countSpan.className = 'filter-count';
  countSpan.textContent = count.toString();
  
  button.appendChild(labelSpan);
  button.appendChild(countSpan);
  
  return button;
};

const createFilterBarElement = (): HTMLDivElement => {
  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';
  filterBar.setAttribute('role', 'tablist');
  filterBar.setAttribute('aria-label', 'Filter todos by status');
  
  const allCount = todos.length;
  const activeCount = getActiveTodoCount();
  const completedCount = getCompletedCount();
  
  const allButton = createFilterButtonElement('all', 'All', allCount);
  const activeButton = createFilterButtonElement('active', 'Active', activeCount);
  const completedButton = createFilterButtonElement('completed', 'Completed', completedCount);
  
  filterBar.appendChild(allButton);
  filterBar.appendChild(activeButton);
  filterBar.appendChild(completedButton);
  
  return filterBar;
};

const createFilterContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  container.className = 'filter-container';
  
  const filterBar = createFilterBarElement();
  container.appendChild(filterBar);
  
  return container;
};

const getFilterContainer = (): HTMLDivElement | null => {
  return document.querySelector('.filter-container') as HTMLDivElement;
};

const isFilterContainerExists = (): boolean => {
  return document.querySelector('.filter-container') !== null;
};

const removeExistingFilterContainer = (): void => {
  const existingContainer = document.querySelector('.filter-container');
  if (existingContainer) {
    existingContainer.remove();
    console.log('Removed existing filter container');
  }
};

const insertFilterContainer = (): void => {
  if (isFilterContainerExists()) {
    removeExistingFilterContainer();
  }
  
  const progressContainer = document.querySelector('.progress-container');
  if (!progressContainer || !progressContainer.parentNode) {
    console.error('Progress container not found for filter insertion');
    return;
  }
  
  const filterContainer = createFilterContainer();
  progressContainer.parentNode.insertBefore(filterContainer, progressContainer.nextSibling);
  console.log('Filter container inserted successfully');
};

const updateSingleFilterButtonCount = (filterType: FilterStatus, count: number): void => {
  const countElement = document.querySelector(`[data-filter="${filterType}"] .filter-count`);
  if (countElement) {
    countElement.textContent = count.toString();
  } else {
    console.warn(`Filter count element not found for: ${filterType}`);
  }
};

const updateFilterButtonCounts = (): void => {
  const counts = {
    all: todos.length,
    active: getActiveTodoCount(),
    completed: getCompletedCount()
  };
  
  updateSingleFilterButtonCount('all', counts.all);
  updateSingleFilterButtonCount('active', counts.active);
  updateSingleFilterButtonCount('completed', counts.completed);
  
  console.log('Filter counts updated:', counts);
};

const updateSingleFilterButtonState = (button: Element, isActive: boolean): void => {
  button.classList.toggle('active', isActive);
  button.setAttribute('aria-pressed', isActive.toString());
};

const updateFilterButtonStates = (): void => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const currentFilterValue = getCurrentFilter();
  
  filterButtons.forEach(button => {
    const buttonFilter = button.getAttribute('data-filter');
    const isActive = buttonFilter === currentFilterValue;
    updateSingleFilterButtonState(button, isActive);
  });
  
  console.log(`Filter states updated - Active filter: ${currentFilterValue}`);
};

const handleFilterButtonClick = (event: Event): void => {
  const target = event.target as HTMLElement;
  const button = target.closest('.filter-btn') as HTMLButtonElement;
  
  if (!button) return;
  
  const filterStatus = button.getAttribute('data-filter') as FilterStatus;
  if (filterStatus) {
    setCurrentFilter(filterStatus);
    renderFilteredTodos();
    FilterSystem.refresh();
  }
};

const addFilterEventListeners = (): void => {
  const filterContainer = getFilterContainer();
  if (filterContainer) {
    filterContainer.addEventListener('click', handleFilterButtonClick);
    console.log('Filter event listeners added');
  } else {
    console.error('Filter container not found for event listeners');
  }
};

//Filter system module 
const FilterSystem = {
  initialize(): void {
    this.insertContainer();
    this.addEventListeners();
    this.updateDisplay();
    console.log('Filter system initialized');
  },

  insertContainer(): void {
    insertFilterContainer();
  },

  addEventListeners(): void {
    addFilterEventListeners();
  },

  updateDisplay(): void {
    updateFilterButtonStates();
    updateFilterButtonCounts();
  },

  refresh(): void {
    this.updateDisplay();
  },

  rebuild(): void {
    removeExistingFilterContainer();
    this.initialize();
  }
};

// Filtered todos rendering 
const renderFilteredTodos = (): void => {
  clearTodoList();
  
  const currentFilterStatus = getCurrentFilter();
  const filteredTodos = filterTodosByStatus(todos, currentFilterStatus);
  
  if (shouldShowEmptyStateForFilter(currentFilterStatus)) {
    showFilteredEmptyState(currentFilterStatus);
    return;
  }
  
  hideEmptyState();
  
  const sortedTodos = sortTodosByPriority(filteredTodos);
  
  sortedTodos.forEach((todo) => {
    const li = createTodoElement(todo);
    addTodoEventListeners(li, todo.id);
    appendTodoToList(li);
  });
  
  console.log(`Rendered ${sortedTodos.length} todos with filter: ${currentFilterStatus}`);
};

// Filtered empty state display 
const showFilteredEmptyState = (filterStatus: FilterStatus): void => {
  if (elements.emptyState) {
    const emptyStateContent = getEmptyStateContentForFilter(filterStatus);
    elements.emptyState.innerHTML = emptyStateContent;
    elements.emptyState.style.display = 'block';
  }
};

// Empty state content for filter 
const getEmptyStateContentForFilter = (filterStatus: FilterStatus): string => {
  switch (filterStatus) {
    case 'active':
      return `
        <div class="empty-icon">✅</div>
        <h3>All tasks completed!</h3>
        <p>Great job! You've completed all your tasks. Add new ones to stay productive.</p>
      `;
    case 'completed':
      return `
        <div class="empty-icon">📋</div>
        <h3>No completed tasks yet!</h3>
        <p>Complete some tasks to see them here. Get started on your active tasks!</p>
      `;
    case 'all':
    default:
      return `
        <div class="empty-icon">📝</div>
        <h3>No todos yet!</h3>
        <p>Add your first todo above to get started organizing your tasks.</p>
      `;
  }
};

const renderTodos = (): void => {
  renderFilteredTodos();
};

const initializeApp = (): void => {
  console.log('Initializing app...');
  initializeDOMReferences();
  initializeFormEventListeners();
  initializeThemeSystem();
  FilterSystem.initialize();
  renderFilteredTodos();
  updateProgressDisplay();
  console.log('App initialized with enhanced filter system');
};

const startApplication = (): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
};

startApplication();