import React, { useEffect } from 'react';

const COMMENTS_CONTAINER_ID = 'comments-container';

const Comments = (props) => {
    if (!!props.issueTerm) {
        useEffect(() => {
            const script = document.createElement('script');
            script.src = 'https://giscus.app/client.js';
            script.setAttribute('data-repo', 'dontpanic92/tuesday');
            script.setAttribute('data-repo-id', 'MDEwOlJlcG9zaXRvcnkzODcyMjM3MTg=');
            script.setAttribute('data-category', 'Comments');
            script.setAttribute('data-category-id', 'DIC_kwDOFxSQps4B-dHm');
            script.setAttribute('data-mapping', 'specific');
            script.setAttribute('data-term', `${props.issueTerm}`);
            script.setAttribute('data-reactions-enabled', '1');
            script.setAttribute('data-emit-metadata', '0');
            script.setAttribute('data-theme', 'light');
            script.setAttribute('crossorigin', 'anonymous');
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