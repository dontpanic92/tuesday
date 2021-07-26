import React, { useEffect } from 'react';

const COMMENTS_CONTAINER_ID = 'comments-container';

const Comments = (props) => {
    if (!!props.issueTerm) {
        useEffect(() => {
            const script = document.createElement('script');
            script.src = 'https://utteranc.es/client.js';
            script.setAttribute('repo', 'dontpanic92/tuesday');
            script.setAttribute('issue-term', `${props.issueTerm}`);
            script.setAttribute('theme', 'github-light');
            script.setAttribute('crossorigin', 'anonymous');
            script.setAttribute('input-position-top', 'true');
            script.async = true;

            const comments = document.getElementById(COMMENTS_CONTAINER_ID);
            if (comments) comments.appendChild(script);

            // This function will get called when the component unmounts
            // To make sure we don't end up with multiple instances of the comments component
            return () => {
                const comments = document.getElementById(COMMENTS_CONTAINER_ID);
                if (comments) comments.innerHTML = '';
            };
        }, []);
    }

    return (
        <div id={COMMENTS_CONTAINER_ID} />
    );
};

export default Comments;