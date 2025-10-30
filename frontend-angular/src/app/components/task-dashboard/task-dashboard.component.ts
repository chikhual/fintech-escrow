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

interface Milestone {
  name: string;
  status: string;
  completion_date?: string;
  description: string;
  dependencies: string[];
  tasks: string[];
}

interface ProjectStatus {
  project_name: string;
  overall_progress: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  efficiency: number;
  milestones: { [key: string]: any };
  last_updated: string;
}

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">FinTech ESCROW - Task Dashboard</h1>
        <p class="text-gray-600 mt-2">Gestión de tareas y seguimiento del proyecto</p>
      </div>

      <!-- Project Status Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Progreso General</p>
              <p class="text-2xl font-bold text-gray-900">{{ projectStatus?.overall_progress | number:'1.1-1' }}%</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Tareas Completadas</p>
              <p class="text-2xl font-bold text-gray-900">{{ projectStatus?.completed_tasks }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">En Progreso</p>
              <p class="text-2xl font-bold text-gray-900">{{ projectStatus?.in_progress_tasks }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pendientes</p>
              <p class="text-2xl font-bold text-gray-900">{{ projectStatus?.pending_tasks }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Milestones Progress -->
      <div class="bg-white rounded-lg shadow mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Progreso por Milestone</h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div *ngFor="let milestone of milestones | keyvalue" class="border rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-medium text-gray-900">{{ milestone.key }}: {{ milestone.value.name }}</h3>
                <span class="px-2 py-1 text-xs font-medium rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800': milestone.value.status === 'completed',
                        'bg-yellow-100 text-yellow-800': milestone.value.status === 'in_progress',
                        'bg-gray-100 text-gray-800': milestone.value.status === 'not_started'
                      }">
                  {{ milestone.value.status | titlecase }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                     [style.width.%]="milestone.value.progress_percentage"></div>
              </div>
              <p class="text-sm text-gray-600">
                {{ milestone.value.completed_tasks }}/{{ milestone.value.total_tasks }} tareas completadas
                ({{ milestone.value.progress_percentage | number:'1.1-1' }}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tasks Table -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-900">Tareas del Proyecto</h2>
            <div class="flex space-x-4">
              <select [(ngModel)]="selectedStatus" (change)="filterTasks()" 
                      class="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
              <select [(ngModel)]="selectedCategory" (change)="filterTasks()" 
                      class="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">Todas las categorías</option>
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
          </div>
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
              <tr *ngFor="let task of filteredTasks" class="hover:bg-gray-50">
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
                  <button (click)="viewTaskDetails(task)" 
                          class="text-indigo-600 hover:text-indigo-900 mr-3">
                    Ver
                  </button>
                  <button (click)="editTask(task)" 
                          class="text-green-600 hover:text-green-900">
                    Editar
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
export class TaskDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  projectStatus: ProjectStatus | null = null;
  milestones: { [key: string]: any } = {};
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = false;
  
  selectedStatus = '';
  selectedCategory = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProjectData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjectData(): void {
    this.loading = true;
    
    // Load project status
    this.http.get<any>('/api/project/status')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.projectStatus = response.project_status;
            this.milestones = response.project_status.milestones;
          }
        },
        error: (error) => {
          console.error('Error loading project status:', error);
        }
      });

    // Load tasks
    this.http.get<any>('/api/project/tasks')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.tasks = response.tasks;
            this.filteredTasks = [...this.tasks];
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.loading = false;
        }
      });
  }

  filterTasks(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const statusMatch = !this.selectedStatus || task.status === this.selectedStatus;
      const categoryMatch = !this.selectedCategory || task.category === this.selectedCategory;
      return statusMatch && categoryMatch;
    });
  }

  viewTaskDetails(task: Task): void {
    // Implement task details view
    console.log('View task details:', task);
  }

  editTask(task: Task): void {
    // Implement task editing
    console.log('Edit task:', task);
  }
}
