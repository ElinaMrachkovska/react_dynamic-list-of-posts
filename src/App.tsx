import classNames from 'classnames';

import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.scss';

import { PostsList } from './components/PostsList';
import { PostDetails } from './components/PostDetails';
import { UserSelector } from './components/UserSelector';
import { Loader } from './components/Loader/Loader';
import { useState } from 'react';
import { User } from './types/User';
import { Post } from './types/Post';
import { client } from './utils/fetchClient';

export const App = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostLoading, setIsPostLoading] = useState(false);
  const [hasPostLoadingError, setHasPostLoadingError] = useState(false);

  const handleUserSelect = (user: User) => {
    setPosts([]);
    setSelectedUser(user);
    setIsPostLoading(true);
    setSelectedPost(null);
    setHasPostLoadingError(false);

    client
      .get<Post[]>(`/posts?userId=${user.id}`)
      .then(setPosts)
      .catch(() => {
        setHasPostLoadingError(true);
      })
      .finally(() => {
        setIsPostLoading(false);
      });
  };

  const canShowPostDetails =
    selectedUser && !isPostLoading && !hasPostLoadingError;

  return (
    <main className="section">
      <div className="container">
        <div className="tile is-ancestor">
          <div className="tile is-parent">
            <div className="tile is-child box is-success">
              <div className="block">
                <UserSelector user={selectedUser} onSelect={handleUserSelect} />
              </div>

              <div className="block" data-cy="MainContent">
                {!selectedUser && (
                  <p data-cy="NoSelectedUser">No user selected</p>
                )}
                {selectedUser && isPostLoading && <Loader />}
                {selectedUser && !isPostLoading && hasPostLoadingError && (
                  <div
                    className="notification is-danger"
                    data-cy="PostLoadingError"
                  >
                    Something went wrong!
                  </div>
                )}
                {canShowPostDetails && posts.length === 0 && (
                  <div className="notification is-warning" data-cy="NoPostsYet">
                    No posts yet
                  </div>
                )}
                {hasPostLoadingError && (
                  <p
                    data-cy="PostsLoadingError"
                    className="notification is-danger"
                  >
                    Unable to load posts
                  </p>
                )}

                {canShowPostDetails && posts.length > 0 && (
                  <PostsList
                    posts={posts}
                    selectedPostId={selectedPost?.id ?? null}
                    onSelectPost={setSelectedPost}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            data-cy="Sidebar"
            className={classNames(
              'tile',
              'is-parent',
              'is-8-desktop',
              'Sidebar',
              { 'Sidebar--open': !!selectedPost },
            )}
          >
            <div className="tile is-child box is-success ">
              <PostDetails post={selectedPost} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
