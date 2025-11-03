import { describe, it, expect } from 'vitest';

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

const addTodo = (todos: Todo [], text:string) => {
    const newTodo: Todo = {
        id: 123,
        text,
        completed: false
    }
    return [...todos, newTodo]; //spread operator
}

const removeTodo = (todos: Todo[], id: number) => {
    return todos.filter(todo => todo.id !== id);
}

describe('addTodo', () => {
    it('should add a new Todo', () => {
      const todos: Todo[] = [];
      const result = addTodo(todos, 'Test Todo');
      expect(result.length).toBe(1);
      expect(result[0].text).toBe('Test Todo');
      expect(result[0].completed).toBe(false);
    })
})

describe('removeTodo', () => {
    it('should remove a Todo by id', () => {
        const todos: Todo[] = [
            { id: 123, text: 'First Todo', completed: false},
            { id: 456, text: 'Another Todo', completed: false}
        ]
        const result = removeTodo(todos, 123);
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(456);
    })

    it('Should do nothing if the id id not found', () => {
        const todos: Todo[] = [
            { id: 123, text: 'First Todo', completed: false},
            { id: 456, text: 'Another Todo', completed: false}
        ]
        const result = removeTodo(todos, 999);
        expect(result.length).toBe(2);
        expect(result[0].id).toBe(123) 
    })
});