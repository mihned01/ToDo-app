// Replace your existing file with this complete implementation:

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

// Application state 
let todos: Todo[] = [];
let currentFilter: FilterStatus = 'all';

// SRP: Priority configuration - Priority data responsibility
const getPriorityOptions = (): PriorityConfig[] => {
  return [
    { label: 'High', value: 'high', color: '#ff6b8a', order: 3 },
    { label: 'Medium', value: 'medium', color: '#ffd54f', order: 2 },
    { label: 'Low', value: 'low', color: '#66d9a5', order: 1 }
  ];
};

// SRP: DOM element references - DOM access responsibility
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

// SRP: DOM references initialization - DOM setup responsibility
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

// SRP: Priority configuration access - Priority config responsibility
const getPriorityConfig = (priority: Priority): PriorityConfig => {
  const options = getPriorityOptions();
  return options.find(option => option.value === priority) || options[1];
};

// SRP: Selected priority retrieval - Priority selection responsibility
const getSelectedPriority = (): Priority => {
  return (elements.prioritySelect?.value as Priority) || 'medium';
};

// SRP: Priority selection reset - Priority reset responsibility
const resetPrioritySelection = (): void => {
  if (elements.prioritySelect) {
    elements.prioritySelect.value = 'medium';
  }
};

// SRP: Priority badge creation - Badge HTML responsibility
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

// SRP: Todo sorting algorithm - Sorting responsibility
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

// SRP: Todo object creation - Object creation responsibility
const createTodo = (text: string, priority: Priority = 'medium'): Todo => {
  return {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    priority: priority
  };
};

// SRP: Todo array management - Array manipulation responsibility
const addTodoToArray = (todo: Todo): void => {
  todos.push(todo);
  console.log('Todo added:', todo);
};

// SRP: Todo lookup - Data retrieval responsibility
const findTodoById = (id: number): Todo | undefined => {
  return todos.find(todo => todo.id === id);
};

// SRP: Todo removal - Array modification responsibility
const removeTodoFromArray = (id: number): void => {
  const initialLength = todos.length;
  todos = todos.filter(todo => todo.id !== id);
  console.log(`Removed todo. Count: ${initialLength} -> ${todos.length}`);
};

// SRP: Todo completion toggle - Status modification responsibility
const toggleTodoCompletion = (todo: Todo): void => {
  todo.completed = !todo.completed;
};

// SRP: Todo toggle by ID - ID-based toggle responsibility
const toggleTodo = (id: number): void => {
  const todo = findTodoById(id);
  if (todo) {
    toggleTodoCompletion(todo);
    console.log('Todo toggled:', todo);
  }
};

// SRP: Progress calculation - Progress math responsibility
const calculateProgress = (): number => {
  if (todos.length === 0) return 0;
  const completedCount = todos.filter(todo => todo.completed).length;
  return Math.round((completedCount / todos.length) * 100);
};

// SRP: Completed count calculation - Count calculation responsibility
const getCompletedCount = (): number => {
  return todos.filter(todo => todo.completed).length;
};

// SRP: Progress visual update - Visual update responsibility
const updateProgressVisual = (percentage: number): void => {
  if (elements.progressFill) {
    elements.progressFill.style.width = `${percentage}%`;
  }
};

// SRP: Progress text update - Text update responsibility
const updateProgressText = (percentage: number, completed: number, total: number): void => {
  if (elements.progressText) {
    elements.progressText.textContent = `${percentage}% completed (${completed}/${total})`;
  }
};

// SRP: Progress display coordination - Progress coordination responsibility
const updateProgressDisplay = (): void => {
  const percentage = calculateProgress();
  const completed = getCompletedCount();
  const total = todos.length;
  
  updateProgressVisual(percentage);
  updateProgressText(percentage, completed, total);
  FilterSystem.refresh(); // Integrated filter refresh
};

// SRP: Input field clearing - Input clearing responsibility
const clearInput = (): void => {
  if (elements.todoInput) {
    elements.todoInput.value = '';
  }
};

// SRP: Checkbox element creation - Checkbox HTML responsibility
const createCheckboxElement = (todo: Todo): string => {
  return `<input type="checkbox" ${todo.completed ? 'checked' : ''}>`;
};

// SRP: Todo text element creation - Text HTML responsibility
const createTodoTextElement = (todo: Todo): string => {
  return `<span class="todo-text">${todo.text}</span>`;
};

// SRP: Remove button element creation - Button HTML responsibility
const createRemoveButtonElement = (): string => {
  return `<button class="remove-btn">Remove</button>`;
};

// SRP: Todo item HTML creation - Item HTML composition responsibility
const createTodoItemHTML = (todo: Todo): string => {
  return `
    ${createCheckboxElement(todo)}
    ${createTodoTextElement(todo)}
    ${createPriorityBadge(todo.priority)}
    ${createRemoveButtonElement()}
  `;
};

// SRP: Todo DOM element creation - DOM element responsibility
const createTodoElement = (todo: Todo): HTMLLIElement => {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  li.innerHTML = createTodoItemHTML(todo);
  li.setAttribute('data-todo-id', todo.id.toString());
  return li;
};

// SRP: Checkbox change handling - Checkbox event responsibility
const handleCheckboxChange = (todoId: number): void => {
  toggleTodo(todoId);
  renderFilteredTodos();
  updateProgressDisplay();
};

// SRP: Remove click handling - Remove event responsibility
const handleRemoveClick = (todoId: number): void => {
  removeTodoFromArray(todoId);
  renderFilteredTodos();
  updateProgressDisplay();
};

// SRP: Todo event listeners setup - Event binding responsibility
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

// SRP: Todo list clearing - List clearing responsibility
const clearTodoList = (): void => {
  if (elements.todoList) {
    const todoItems = elements.todoList.querySelectorAll('.todo-item');
    todoItems.forEach(item => item.remove());
  }
};

// SRP: Todo element appending - Element appending responsibility
const appendTodoToList = (todoElement: HTMLLIElement): void => {
  if (elements.todoList) {
    elements.todoList.appendChild(todoElement);
  }
};

// SRP: Empty state showing - Empty state display responsibility
const showEmptyState = (): void => {
  if (elements.emptyState) {
    elements.emptyState.style.display = 'block';
  }
};

// SRP: Empty state hiding - Empty state hiding responsibility
const hideEmptyState = (): void => {
  if (elements.emptyState) {
    elements.emptyState.style.display = 'none';
  }
};

// SRP: Empty list checking - Empty state validation responsibility
const isTodosListEmpty = (): boolean => {
  return todos.length === 0;
};

// SRP: Main todo addition - Todo addition coordination responsibility
const addTodo = (text: string): void => {
  const priority = getSelectedPriority();
  const newTodo = createTodo(text, priority);
  addTodoToArray(newTodo);
  renderFilteredTodos();
  updateProgressDisplay();
  clearInput();
  resetPrioritySelection();
};

// SRP: Input validation - Input validation responsibility
const isValidInput = (text: string): boolean => {
  return text.trim() !== '';
};

// SRP: Form submit handling - Form event responsibility
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

// SRP: Form event listeners initialization - Form event setup responsibility
const initializeFormEventListeners = (): void => {
  if (elements.todoForm) {
    elements.todoForm.addEventListener('submit', handleFormSubmit);
    console.log('Form event listener added');
  } else {
    console.error('Cannot add event listener: form not found');
  }
};

// SRP: Dark mode detection - Mode detection responsibility
const isDarkModeEnabled = (): boolean => {
  return document.body.classList.contains('dark-mode');
};

// SRP: Theme storage retrieval - Storage access responsibility
const getStoredTheme = (): string | null => {
  return localStorage.getItem('theme');
};

// SRP: Theme storage - Storage responsibility
const storeTheme = (theme: string): void => {
  localStorage.setItem('theme', theme);
};

// SRP: Dark mode application - Dark mode responsibility
const applyDarkMode = (): void => {
  document.body.classList.add('dark-mode');
};

// SRP: Light mode application - Light mode responsibility
const applyLightMode = (): void => {
  document.body.classList.remove('dark-mode');
};

// SRP: Theme toggle icon update - Icon update responsibility
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

// SRP: Theme toggle logic - Theme toggle responsibility
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

// SRP: Stored theme application - Stored theme responsibility
const applyStoredTheme = (): void => {
  const storedTheme = getStoredTheme();
  if (storedTheme === 'dark') {
    applyDarkMode();
  } else {
    applyLightMode();
  }
};

// SRP: Theme toggle click handling - Theme click responsibility
const handleThemeToggleClick = (): void => {
  toggleTheme();
};

// SRP: Theme event listeners setup - Theme event responsibility
const initializeThemeEventListeners = (): void => {
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener('click', handleThemeToggleClick);
    console.log('Theme toggle event listener added');
  } else {
    console.error('Cannot add event listener: theme toggle not found');
  }
};

// SRP: Theme system initialization - Theme system responsibility
const initializeThemeSystem = (): void => {
  applyStoredTheme();
  updateThemeToggleIcon();
  initializeThemeEventListeners();
  console.log('Theme system initialized');
};

// ========== ENHANCED FILTER SYSTEM (SRP-COMPLIANT) ==========

// SRP: Filter todos by status - Status filtering responsibility
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

// SRP: Current filter access - Filter state access responsibility
const getCurrentFilter = (): FilterStatus => {
  return currentFilter;
};

// SRP: Filter state modification - Filter state responsibility
const setCurrentFilter = (status: FilterStatus): void => {
  currentFilter = status;
  console.log('Filter changed to:', status);
};

// SRP: Active todo counting - Active count responsibility
const getActiveTodoCount = (): number => {
  return todos.filter(todo => !todo.completed).length;
};

// SRP: Filtered todo counting - Filtered count responsibility
const getFilteredTodoCount = (status: FilterStatus): number => {
  return filterTodosByStatus(todos, status).length;
};

// SRP: Empty state validation for filter - Filter empty state responsibility
const shouldShowEmptyStateForFilter = (status: FilterStatus): boolean => {
  return getFilteredTodoCount(status) === 0;
};

// SRP: Individual filter button creation - Button creation responsibility
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

// SRP: Filter bar element creation - Filter bar creation responsibility
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

// SRP: Filter container creation - Container creation responsibility
const createFilterContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  container.className = 'filter-container';
  
  const filterBar = createFilterBarElement();
  container.appendChild(filterBar);
  
  return container;
};

// SRP: Filter container access - Container access responsibility
const getFilterContainer = (): HTMLDivElement | null => {
  return document.querySelector('.filter-container') as HTMLDivElement;
};

// SRP: Filter container existence check - Existence validation responsibility
const isFilterContainerExists = (): boolean => {
  return document.querySelector('.filter-container') !== null;
};

// SRP: Filter container removal - Container cleanup responsibility
const removeExistingFilterContainer = (): void => {
  const existingContainer = document.querySelector('.filter-container');
  if (existingContainer) {
    existingContainer.remove();
    console.log('Removed existing filter container');
  }
};

// SRP: Filter container insertion - Container insertion responsibility
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

// SRP: Individual button count update - Single button update responsibility
const updateSingleFilterButtonCount = (filterType: FilterStatus, count: number): void => {
  const countElement = document.querySelector(`[data-filter="${filterType}"] .filter-count`);
  if (countElement) {
    countElement.textContent = count.toString();
  } else {
    console.warn(`Filter count element not found for: ${filterType}`);
  }
};

// SRP: Filter button counts update - Count update coordination responsibility
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

// SRP: Individual button state update - Single button state responsibility
const updateSingleFilterButtonState = (button: Element, isActive: boolean): void => {
  button.classList.toggle('active', isActive);
  button.setAttribute('aria-pressed', isActive.toString());
};

// SRP: Filter button states update - State update coordination responsibility
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

// SRP: Filter button click handling - Filter click responsibility
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

// SRP: Filter event listeners setup - Filter event responsibility
const addFilterEventListeners = (): void => {
  const filterContainer = getFilterContainer();
  if (filterContainer) {
    filterContainer.addEventListener('click', handleFilterButtonClick);
    console.log('Filter event listeners added');
  } else {
    console.error('Filter container not found for event listeners');
  }
};

// SRP: Filter system module - Filter system encapsulation responsibility
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

// SRP: Filtered todos rendering - Filtered rendering responsibility
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

// SRP: Filtered empty state display - Filtered empty state responsibility
const showFilteredEmptyState = (filterStatus: FilterStatus): void => {
  if (elements.emptyState) {
    const emptyStateContent = getEmptyStateContentForFilter(filterStatus);
    elements.emptyState.innerHTML = emptyStateContent;
    elements.emptyState.style.display = 'block';
  }
};

// SRP: Empty state content for filter - Empty state content responsibility
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

// SRP: Main rendering coordination - Render coordination responsibility
const renderTodos = (): void => {
  renderFilteredTodos();
};

// SRP: App initialization - App initialization responsibility
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

// SRP: Application startup - Application lifecycle responsibility
const startApplication = (): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
};

// Start the application
startApplication();