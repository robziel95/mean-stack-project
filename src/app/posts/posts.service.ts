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
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();
  //private so we can emit from this file, but can not emit from anywhere else

  constructor(private http: HttpClient, private router: Router) { }

  getPosts(postsPerPage: number, currentPage: number){
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    //Backticks!!! add dynamic value injection to normal string
    this.http.get<{message: string, posts: any, maxPosts: number}>('http://localhost:3000/api/posts' + queryParams)

      //pipe.map is uded to change _id into just id
      .pipe(map(
        (postData) => {
          return {
            posts: postData.posts.map(post => {
              return{
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath
              };
            }),
            maxPosts: postData.maxPosts
          };
        }
      ))
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostData.maxPosts});
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
        this.router.navigate(["/"]);
      }
    );
  }

  deletePost(postId: string){
    return this.http.delete("http://localhost:3000/api/posts/" + postId);
  }
}
