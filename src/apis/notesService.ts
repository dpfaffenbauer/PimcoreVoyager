/**
 * Notes Service
 * Handles fetching notes for elements
 */

import { getApiClient } from './apiClient';

export type NoteElementType = 'data-object' | 'asset' | 'document';

export interface Note {
  id: number;
  type: string;
  cId: number;
  cType: string;
  cPath: string;
  date: number;
  title: string;
  description: string;
  locked: boolean;
  data: any[];
  userId: number | null;
  userName: string | null;
  additionalAttributes: any[];
}

export interface NotesResponse {
  totalItems: number;
  items: Note[];
}

export interface CreateNoteRequest {
  type: string;
  title: string;
  description: string;
}

export class NotesService {
  /**
   * Get notes for a specific element
   * Endpoint: GET /pimcore-studio/api/notes/{elementType}/{id}
   */
  static async getNotes(
    elementType: NoteElementType,
    elementId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<NotesResponse> {
    try {
      const apiClient = getApiClient();
      const path = `/notes/${elementType}/${elementId}`;
      const response = await apiClient.get<NotesResponse>(path, {
        params: { page, pageSize },
      });

      return {
        totalItems: response.data.totalItems || 0,
        items: response.data.items || [],
      };
    } catch (error) {
      console.error('Error fetching notes:', error);
      return { totalItems: 0, items: [] };
    }
  }

  /**
   * Create a new note for a specific element
   * Endpoint: POST /pimcore-studio/api/notes/{elementType}/{id}
   */
  static async createNote(
    elementType: NoteElementType,
    elementId: number,
    noteData: CreateNoteRequest
  ): Promise<Note | null> {
    try {
      const apiClient = getApiClient();
      const path = `/notes/${elementType}/${elementId}`;
      const response = await apiClient.post<Note>(path, noteData);
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  /**
   * Delete a note by ID
   * Endpoint: DELETE /pimcore-studio/api/notes/{noteId}
   */
  static async deleteNote(noteId: number): Promise<boolean> {
    try {
      const apiClient = getApiClient();
      await apiClient.delete(`/notes/${noteId}`);
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
}
