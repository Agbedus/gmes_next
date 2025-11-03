import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'designbundles.net',
        port: '',
        pathname: '/kidside-studio/**',
      },
      // Hosts used by consortium logos and external resources in the phase_two data
      { protocol: 'https', hostname: 'upload.wikimedia.org', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'gmes4africa.org', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'gmesafrica.cicos.int', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'cicos.int', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.cicos.int', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'marcosio.org', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'marcosouth.org', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.icpac.net', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'icpac.net', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'pbs.twimg.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'phosphor.utils.elfsightcdn.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'sasscal.org', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'rcmrd.org', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'oss-online.org', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'geoportal.gmes.ug.edu.gh', port: '', pathname: '/**' },
    ],
  },
};

export default nextConfig;
