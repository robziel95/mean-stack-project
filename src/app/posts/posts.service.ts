import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
  //Creates one instance of service in whole app, everywhere its the same service
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();
  //private so we can emit from this file, but can not emit from anywhere else

  constructor() { }

  getPosts(){
    return [...this.posts];
    //return by copy, not by reference
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string){
    const post: Post = {title: title, content: content};
    this.posts.push(post);
    this.postsUpdated.next([...this.posts]);
    //Emit event (subject), that the posts were updated, and send copy of posts with it
  }
}
