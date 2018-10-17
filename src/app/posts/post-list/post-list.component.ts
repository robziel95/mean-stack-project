import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { post } from 'selenium-webdriver/http';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub: Subscription;

  // postService: PostsService;
  // constructor(postsService2: PostsService) {
  //   this.postService = postsService2;
  // }

  //alternative for commented constructor
  constructor (public postsService: PostsService) {}

  ngOnInit() {
    this.postsService.getPosts();

    //this.postsSub is used to avoid memmory leaks
    this.postsSub = this.postsService.getPostUpdateListener().subscribe(
      //set up listener to check if posts were updated, it has 3 arguments next, error and complete:
      // fuction which is executed when new data is emited, func. when error, func. when observable is completed
      (postsChanged: Post[]) => {
        this.posts = postsChanged;
      }
    );
  }

  onDelete(postId: string){
    this.postsService.deletePost(postId);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    //unsubscribe in order to avoid memmory leaks
  }
}
