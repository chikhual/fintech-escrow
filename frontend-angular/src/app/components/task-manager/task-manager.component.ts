import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

interface Task {
  task_id: string;
  title: string;
  description: string;
  milestone: string;
  category: string;
  status: string;
  priority: string;
  assignee: string;
  created_at: string;
  updated_at?: string;
  estimated_hours: number;
  actual_hours: number;
  dependencies: string[];
  notes?: string;
}

interface TaskForm {
  title: string;
  description: string;
  milestone: string;
  category: string;
  priority: string;
  assignee: string;
  estimated_hours: number;
  dependencies: string[];
}

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestión de Tareas</h1>
        <p class="text-gray-600 mt-2">Crear, editar y gestionar tareas del proyecto</p>
      </div>

      <!-- Create Task Form -->
      <div class="bg-white rounded-lg shadow mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ editingTask ? 'Editar Tarea' : 'Crear Nueva Tarea' }}
          </h2>
        </div>
        <div class="p-6">
          <form (ngSubmit)="onSubmit()" #formRef="ngForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700">Título *</label>
                <input type="text" id="title" name="title" [(ngModel)]="taskForm.title" 
                       required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              
              <div>
                <label for="milestone" class="block text-sm font-medium text-gray-700">Milestone *</label>
                <select id="milestone" name="milestone" [(ngModel)]="taskForm.milestone" 
                        required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Seleccionar milestone</option>
                  <option value="M1">M1: Preparación de Infraestructura</option>
                  <option value="M2">M2: Desarrollo Backend</option>
                  <option value="M3">M3: Desarrollo Frontend</option>
                  <option value="M4">M4: Integración de Seguridad</option>
                  <option value="M5">M5: Pruebas QA</option>
                  <option value="M6">M6: Demo y Despliegue</option>
                </select>
              </div>
              
              <div>
                <label for="category" class="block text-sm font-medium text-gray-700">Categoría *</label>
                <select id="category" name="category" [(ngModel)]="taskForm.category" 
                        required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Seleccionar categoría</option>
                  <option value="infrastructure">Infraestructura</option>
                  <option value="backend">Backend</option>
                  <option value="frontend">Frontend</option>
                  <option value="security">Seguridad</option>
                  <option value="testing">Pruebas</option>
                  <option value="deployment">Despliegue</option>
                  <option value="documentation">Documentación</option>
                  <option value="integration">Integración</option>
                </select>
              </div>
              
              <div>
                <label for="priority" class="block text-sm font-medium text-gray-700">Prioridad *</label>
                <select id="priority" name="priority" [(ngModel)]="taskForm.priority" 
                        required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Seleccionar prioridad</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              
              <div>
                <label for="assignee" class="block text-sm font-medium text-gray-700">Asignado</label>
                <input type="text" id="assignee" name="assignee" [(ngModel)]="taskForm.assignee" 
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              
              <div>
                <label for="estimated_hours" class="block text-sm font-medium text-gray-700">Horas Estimadas</label>
                <input type="number" id="estimated_hours" name="estimated_hours" [(ngModel)]="taskForm.estimated_hours" 
                       min="0" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>
            
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Descripción *</label>
              <textarea id="description" name="description" [(ngModel)]="taskForm.description" 
                        rows="4" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
            
            <div>
              <label for="dependencies" class="block text-sm font-medium text-gray-700">Dependencias</label>
              <input type="text" id="dependencies" name="dependencies" [(ngModel)]="dependenciesInput" 
                     placeholder="Separar IDs de tareas con comas (ej: M1-1, M2-3)"
                     class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            
            <div class="flex justify-end space-x-4">
              <button type="button" (click)="cancelEdit()" 
                      class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancelar
              </button>
              <button type="submit" [disabled]="!formRef.form.valid || loading"
                      class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {{ editingTask ? 'Actualizar Tarea' : 'Crear Tarea' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Task List -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Lista de Tareas</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarea</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let task of tasks" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ task.title }}</div>
                    <div class="text-sm text-gray-500">{{ task.description }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.milestone }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': task.status === 'completed',
                          'bg-yellow-100 text-yellow-800': task.status === 'in_progress',
                          'bg-gray-100 text-gray-800': task.status === 'pending',
                          'bg-red-100 text-red-800': task.status === 'cancelled'
                        }">
                    {{ task.status | titlecase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="{
                          'bg-red-100 text-red-800': task.priority === 'critical',
                          'bg-orange-100 text-orange-800': task.priority === 'high',
                          'bg-yellow-100 text-yellow-800': task.priority === 'medium',
                          'bg-green-100 text-green-800': task.priority === 'low'
                        }">
                    {{ task.priority | titlecase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.assignee || 'Sin asignar' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.actual_hours }}/{{ task.estimated_hours }}h
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button (click)="editTask(task)" 
                          class="text-indigo-600 hover:text-indigo-900 mr-3">
                    Editar
                  </button>
                  <button (click)="updateTaskStatus(task)" 
                          class="text-green-600 hover:text-green-900 mr-3">
                    Cambiar Estado
                  </button>
                  <button (click)="deleteTask(task)" 
                          class="text-red-600 hover:text-red-900">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-lg p-6">
          <div class="flex items-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span class="ml-3 text-gray-700">Cargando...</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TaskManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  tasks: Task[] = [];
  editingTask: Task | null = null;
  loading = false;
  
  taskForm: TaskForm = {
    title: '',
    description: '',
    milestone: '',
    category: '',
    priority: '',
    assignee: '',
    estimated_hours: 0,
    dependencies: []
  };
  
  dependenciesInput = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.loading = true;
    this.http.get<any>('/api/project/tasks')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.tasks = response.tasks;
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.editingTask) {
      this.updateTask();
    } else {
      this.createTask();
    }
  }

  createTask(): void {
    this.loading = true;
    
    // Parse dependencies
    const dependencies = this.dependenciesInput 
      ? this.dependenciesInput.split(',').map(dep => dep.trim()).filter(dep => dep)
      : [];
    
    const taskData = {
      ...this.taskForm,
      dependencies
    };
    
    // Generate task ID
    const taskId = `${this.taskForm.milestone}-${Date.now()}`;
    
    this.http.post<any>('/api/project/tasks', {
      task_id: taskId,
      ...taskData
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.loadTasks();
          this.resetForm();
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.loading = false;
      }
    });
  }

  updateTask(): void {
    if (!this.editingTask) return;
    
    this.loading = true;
    
    // Parse dependencies
    const dependencies = this.dependenciesInput 
      ? this.dependenciesInput.split(',').map(dep => dep.trim()).filter(dep => dep)
      : [];
    
    const taskData = {
      ...this.taskForm,
      dependencies
    };
    
    this.http.put<any>(`/api/project/tasks/${this.editingTask.task_id}`, taskData)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.loadTasks();
          this.resetForm();
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.loading = false;
      }
    });
  }

  editTask(task: Task): void {
    this.editingTask = task;
    this.taskForm = {
      title: task.title,
      description: task.description,
      milestone: task.milestone,
      category: task.category,
      priority: task.priority,
      assignee: task.assignee || '',
      estimated_hours: task.estimated_hours,
      dependencies: task.dependencies
    };
    this.dependenciesInput = task.dependencies.join(', ');
  }

  updateTaskStatus(task: Task): void {
    const newStatus = prompt('Nuevo estado (pending, in_progress, completed, cancelled):', task.status);
    if (newStatus && newStatus !== task.status) {
      this.loading = true;
      
      this.http.put<any>(`/api/project/tasks/${task.task_id}/status`, {
        new_status: newStatus,
        actual_hours: task.actual_hours,
        notes: task.notes
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTasks();
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error updating task status:', error);
          this.loading = false;
        }
      });
    }
  }

  deleteTask(task: Task): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`)) {
      this.loading = true;
      
      this.http.delete<any>(`/api/project/tasks/${task.task_id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTasks();
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.loading = false;
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingTask = null;
    this.resetForm();
  }

  resetForm(): void {
    this.taskForm = {
      title: '',
      description: '',
      milestone: '',
      category: '',
      priority: '',
      assignee: '',
      estimated_hours: 0,
      dependencies: []
    };
    this.dependenciesInput = '';
  }
}
