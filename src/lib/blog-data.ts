
export interface BlogPost {
  title: string;
  date: string;
  excerpt: string;
  imageSrc: string;
  imageAiHint: string;
  slug: string;
  content: string; // HTML content for the blog post
}

export const blogPosts: BlogPost[] = [
  {
    title: "First Blog Post: Getting Started",
    date: "July 29, 2024",
    excerpt: "This is a brief introduction to our new blog. We'll be sharing insights and updates regularly.",
    imageSrc: "https://placehold.co/600x400.png",
    imageAiHint: "writing blog",
    slug: "first-blog-post",
    content: `
      <h2 class="text-2xl font-semibold mb-4">Welcome to Our Blog!</h2>
      <p class="mb-4">This is the full content of our first blog post. We are excited to start sharing content with you. Here, you'll find articles about various topics, insights, and news related to our field.</p>
      <p class="mb-4">Our goal is to provide valuable information and foster a community around our shared interests. We encourage you to read, comment, and engage with our posts.</p>
      <h3 class="text-xl font-semibold mt-6 mb-2">What to Expect</h3>
      <ul class="list-disc list-inside space-y-1 mb-4">
        <li>In-depth articles and tutorials.</li>
        <li>News and updates about our projects.</li>
        <li>Opinion pieces and thought leadership.</li>
        <li>Community highlights and guest posts.</li>
      </ul>
      <p>Stay tuned for more exciting content!</p>
    `,
  },
  {
    title: "Understanding a Key Concept",
    date: "July 30, 2024",
    excerpt: "A deep dive into a fundamental concept that everyone should understand. Explore the basics and advanced applications.",
    imageSrc: "https://placehold.co/600x400.png",
    imageAiHint: "learning concept",
    slug: "understanding-key-concept",
    content: `
      <h2 class="text-2xl font-semibold mb-4">Exploring a Key Concept</h2>
      <p class="mb-4">In this post, we delve into a concept that is crucial for understanding many aspects of our work. We will break it down into manageable parts and explore its implications.</p>
      <h3 class="text-xl font-semibold mt-6 mb-2">The Basics</h3>
      <p class="mb-4">Let's start with the foundational elements. Understanding these is key to grasping the more complex ideas that build upon them.</p>
      <h3 class="text-xl font-semibold mt-6 mb-2">Advanced Applications</h3>
      <p class="mb-4">Once the basics are clear, we can look at how this concept is applied in more advanced scenarios. This is where the real power of this idea becomes evident.</p>
      <figure class="my-6">
        <img src="https://placehold.co/700x450.png" alt="Conceptual diagram" class="mx-auto rounded-lg shadow-md" data-ai-hint="diagram chart" />
        <figcaption class="text-center text-sm text-muted-foreground mt-2">A visual representation of the concept.</figcaption>
      </figure>
      <p>We hope this exploration helps you better understand this important topic.</p>
    `,
  },
  {
    title: "Future Trends to Watch",
    date: "July 31, 2024",
    excerpt: "Looking ahead: What are the emerging trends that will shape our industry in the coming years?",
    imageSrc: "https://placehold.co/600x400.png",
    imageAiHint: "futuristic technology",
    slug: "future-trends",
    content: `
      <h2 class="text-2xl font-semibold mb-4">Emerging Trends for the Future</h2>
      <p class="mb-4">The landscape of our industry is constantly evolving. In this post, we highlight some of the key trends that we believe will have a significant impact in the near future.</p>
      <h3 class="text-xl font-semibold mt-6 mb-2">Trend 1: Artificial Intelligence</h3>
      <p class="mb-4">AI continues to be a driving force, with new applications emerging regularly. We discuss its potential impact on various sectors.</p>
      <h3 class="text-xl font-semibold mt-6 mb-2">Trend 2: Sustainability</h3>
      <p class="mb-4">Sustainable practices are becoming increasingly important. We explore how businesses are adapting and innovating in this area.</p>
      <h3 class="text-xl font-semibold mt-6 mb-2">Trend 3: Remote Collaboration</h3>
      <p class="mb-4">The shift towards remote work has spurred innovation in collaboration tools and practices. We look at what's next.</p>
      <p>Keeping an eye on these trends will be crucial for staying ahead.</p>
    `,
  },
];
