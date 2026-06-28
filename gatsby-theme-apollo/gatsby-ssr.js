import PageLayout from './src/components/page-layout';
import React from 'react';
import { Layout } from './core-exports';

export const wrapPageElement = (
  { element, props }, // eslint-disable-line react/prop-types
  pluginOptions
) => {
  if (props?.data?.file?.sourceInstanceName === "content") {
    return <PageLayout {...props} pluginOptions={pluginOptions}>
      {element}
    </PageLayout>
  } else {
    return <Layout>
      {element}
    </Layout>
  }
};
