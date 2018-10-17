import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
  //Creates one instance of service in whole app, everywhere its the same service
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();
  //private so we can emit from this file, but can not emit from anywhere else

  constructor(private http: HttpClient) { }

  getPosts(){
    this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')

      //pipe.map is uded to change _id into just id
      .pipe(map(
        (postData) => {
          return postData.posts.map(post => {
            return{
              title: post.title,
              content: post.content,
              id: post._id
            };
          });
        }
      ))
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      }
    );
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string){
    const post: Post = {id: null, title: title, content: content};
    this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', post)
      .subscribe(responseData => {
          const id = responseData.postId;
          post.id = id;
          //this will execute only when we have success response
          this.posts.push(post);
          this.postsUpdated.next([...this.posts]);
          //Emit event (subject), that the posts were updated, and send copy of posts with it
      }
      );
  }

  deletePost(postId: string){
    this.http.delete("http://localhost:3000/api/posts/" + postId).subscribe(
      () => {
        const updatedPosts = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      }
    );
  }
}
