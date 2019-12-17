import Vue from 'vue';
import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators';
import store from '..';
import BooksAPI from '../../api/books';
import convertList from '../../helpers/convertArrayToNested';

interface BookState {
  books: BookCollection;
  failure: any;
}

export interface Book {
  barcode: string,
  title_id: number,
  status: string,
  created_at: string,
  updated_at: string
}

export interface GResponse {
  kind: string,
  items: [],
  totalItems: number
}
interface BookCollection {
  [id: string]: Book;
}



@Module({dynamic: true, namespaced: true, name: 'BooksModule', store})
class BooksModule extends VuexModule {
  private bookState: BookState = {books: {}, failure: null};

  get all() {
    return this.bookState.books;
  }

  get allAsArray() {
    return Object.keys(this.bookState.books).map((id) => this.bookState.books[id]);
  }

  @Action({rawError: true})
  public fetchAll() {
    return new Promise((resolve, reject) => {
      BooksAPI.all()
        .then((response: any) => {
          this.convertBookList(response);
          resolve();
        })
        .catch((error: any) => {
          this.setfailure(error);
          reject(error);
        });
    });
  }

  @Action({rawError: true})
  public fetchSingle(barcode: string): Promise<Book> {
    return new Promise((resolve, reject) => {
      BooksAPI.single(barcode)
        .then((response: any) => {
          resolve();
        })
        .catch((error: any) => {
          this.setfailure(error);
          reject(error);
        });
    });
  }

  @Action({rawError: true})
  public create(request: any) {
    return new Promise((resolve, reject) => {
      BooksAPI.create(request)
        .then((response: any) => {
          this.setBooks(response);
          resolve(response);
        })
        .catch((error: any) => {
          this.setfailure(error);
          reject(error);
        });
    });
  }

  @Action({rawError: true})
  public update(request: Book) {
    return new Promise((resolve, reject) => {
      BooksAPI.update(request)
        .then((response: any) => {
          this.setBooks(response);
          resolve(response);
        })
        .catch((error: any) => {
          this.setfailure(error);
          reject(error);
        });
    });
  }

  @Action({rawError: true})
  public delete(request: any) {
    return new Promise((resolve, reject) => {
      BooksAPI.delete(request)
        .then((response: any) => {
          this.removeBook(response);
          resolve(response);
        })
        .catch((error: any) => {
          this.setfailure(error);
          reject(error);
        });
    });
  }

  @Mutation
  private setBooks(payload: any) {
    Vue.set(this.bookState.books, payload.barcode, payload);
  }

  @Mutation
  private removeBook(bookId: string) {
    Vue.delete(this.bookState.books, bookId);
  }

  @Mutation
  private setfailure(payload: any) {
    this.bookState.failure = payload;
  }
  @Mutation
  private convertBookList(payload: any) {
    const list = convertList(payload, 'barcode');
    this.bookState.books = list;
  }
}

export default getModule(BooksModule);
