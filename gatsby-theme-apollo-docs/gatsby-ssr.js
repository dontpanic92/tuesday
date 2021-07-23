import PageLayout from './src/components/page-layout';
import React from 'react';
import { FlexWrapper, Layout } from 'gatsby-theme-apollo-core';

export const onRenderBody = (
  {setPostBodyComponents, setHeadComponents},
  {ffWidgetId}
) => {
  if (ffWidgetId) {
    setHeadComponents([
      <script
        key="feedback"
        dangerouslySetInnerHTML={{
          __html: `
          var ffWidgetId = '${ffWidgetId}';
          var ffWidgetScript = document.createElement("script");
          ffWidgetScript.type = "text/javascript";
          ffWidgetScript.src = 'https://freddyfeedback.com/widget/freddyfeedback.js';
          document.head.appendChild(ffWidgetScript);
        `
        }}
      />,
      <script key="utm" src="https://www.apollographql.com/utm-grabber.js" />
    ]);
  }

  setPostBodyComponents([
    React.createElement('script', {
      key: 'docsearch',
      src:
        'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js'
    })
  ]);
};

export const wrapPageElement = (
  {element, props}, // eslint-disable-line react/prop-types
  pluginOptions
) => {
  if (props?.data?.file?.sourceInstanceName === "content") {
    return <PageLayout {...props} pluginOptions={pluginOptions}>
      {element}
    </PageLayout>
  } else {
    return <Layout>
      <FlexWrapper>
        <div>
          {element}
        </div>
      </FlexWrapper>
    </Layout>
  }
};
