import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
  //Creates one instance of service in whole app, everywhere its the same service
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();
  //private so we can emit from this file, but can not emit from anywhere else

  constructor(private http: HttpClient, private router: Router) { }

  getPosts(){
    this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')

      //pipe.map is uded to change _id into just id
      .pipe(map(
        (postData) => {
          return postData.posts.map(post => {
            return{
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath
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

  addPost(title: string, content: string, image: File){
    //const post: Post = {id: null, title: title, content: content};
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title)

    this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData)
      .subscribe(
        responseData => {
          const post: Post = {
            id: responseData.post.id,
            title: title,
            content: content,
            imagePath: responseData.post.imagePath
          }
          this.posts.push(post);
          this.postsUpdated.next([...this.posts]);
          //Emit event (subject), that the posts were updated, and send copy of posts with it

          this.router.navigate(["/"]);
        }
      );
  }

  getPost(id: string){
    //return {...this.posts.find(p => p.id === id)}
    //instead of geeting post from local array, we get it from the server, so when page is reloaded state is not lost
    return this.http.get<{_id: string, title: string, content: string, imagePath: string}>('http://localhost:3000/api/posts/' + id);
  }

  updatePost(id: string, title: string, content: string, image: File | string){
    //const post: Post = { id: id, title: title, content: content, imagePath: null};
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image
      };
    }
    this.http.put('http://localhost:3000/api/posts/' + id, postData).subscribe(
      response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
        const post: Post = {
          id: id,
          title: title,
          content: content,
          imagePath: ""
        }
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
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
