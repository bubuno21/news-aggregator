# News Aggregator with Crowdsourced Bias Insights
## Product Requirements Document

## 1. Overview

The product is an unbiased news aggregation platform that collects all English-language news stories without any bias-based filtering at the ingestion stage. Every news article from across the spectrum is aggregated and grouped by story, ensuring multiple sources for the same event are presented together. On top of this neutral aggregation, the platform provides a crowdsourced commentary system to highlight biases and consensus in coverage.

Users can contribute short comments or notes on news stories, and an algorithmic system (inspired by tools like Pol.is and Twitter's Community Notes) analyzes these contributions to surface summarized insights from diverse perspectives. The platform does not hide bias in content – instead, it highlights bias explicitly through community input and patterns of agreement/disagreement.

## 2. Goals

- **Comprehensive Coverage**: Aggregate all English-language news stories in one place, giving users a one-stop destination for news without partisan filtering.
- **Transparency in Bias**: Expose and highlight potential biases in news coverage through visible community comments and consensus insights, rather than filtering biased content out.
- **Diverse Perspectives & Consensus**: Encourage a broad range of viewpoints and use algorithms to identify points of agreement across different ideological clusters, prioritizing cross-cluster consensus as valuable insight.
- **User Engagement and Trust**: Allow readers to actively engage (vote, comment) on news stories, increasing trust through community validation and collaborative fact-checking.
- **Story Deduplication**: Group multiple articles about the same story or event together, reducing duplicate content and focusing discussion on the story level rather than individual articles.

## 3. Use Cases

### 3.1. General News Reader
A user visits the platform to catch up on current events. They see top stories with multiple source articles listed under each story. The user can read a summary of community insights highlighting if different political groups view the story differently or if there are any consensus notes agreeing on key facts. This helps the reader get a more balanced understanding of the news.

### 3.2. Bias Explorer
A user suspicious of media bias wants to see how various outlets cover a controversial topic. They use the platform to read several versions of the story from different sources side by side. In the crowdsourced comments section, they see clusters of opinions and a highlighted comment that multiple clusters agreed on, indicating a common ground point.

### 3.3. Contributing User (Registered)
A passionate reader registers an account to participate. They come across a story and notice missing context or bias. They add a constructive comment providing additional context. Other users vote on this comment's helpfulness. The system algorithm detects that users from different voting clusters find the comment helpful, so it boosts this comment as a "Community Consensus Note" at the top of the discussion.

### 3.4. Anonymous Browser
An unregistered visitor browses headlines and community insights without logging in. They cannot vote or comment, but they benefit from the aggregated news and the visible crowd commentary that flags diverse perspectives. If they find the feature useful, they may choose to sign up to contribute themselves.

## 4. Solution Components

### 4.1. Aggregation Component

#### 4.1.1. Ingestion of All Sources
- Continuously ingests news articles from a wide range of English-language sources
- No filtering or ranking based on political leaning or bias
- Focuses on relevance (newsworthiness, recency) rather than ideological filtering

#### 4.1.2. Story Clustering & Deduplication
- Automated clustering algorithm groups articles reporting on the same story or event
- Uses Natural Language Processing (semantic similarity and entity/event detection)
- Groups all related articles under a single story entry

#### 4.1.3. Neutral Presentation
- Stories presented sorted by time, importance/trending, or user-selected topics
- No source suppression or prioritization for ideological reasons
- Users can filter by category or search for topics

#### 4.1.4. Full Content Access
- For each story cluster, users can expand to see headlines from each source
- Click through to read full articles on original publishers' sites (or within app if licensed)
- Shows snippets or summaries with credit and traffic back to publishers for full articles

### 4.2. Crowdsourcing & Bias Exploration Component

#### 4.2.1. Crowdsourced Comments
- Users can contribute comments, context notes, or fact-checks below each story cluster
- Comments are short and focused, highlighting bias, providing context, or pointing out consensus facts
- Visibility and order determined algorithmically rather than by simple upvote count

#### 4.2.2. Behavioral Clustering of Users
- System analyzes user interactions with comments
- Automatically sorts users (and their comments) into clusters of like-minded perspective
- Clusters generated without asking for personal bias info

#### 4.2.3. Algorithmic Consensus Detection
- Comment ranking algorithm identifies comments that receive positive votes from users across different clusters
- Cross-cluster consensus comments prioritized at the top of the discussion
- Highlights points of agreement that bridge ideological divides

#### 4.2.4. Transparent Perspective Highlights
- Comments displayed with indicators reflecting support within each cluster
- Users can toggle views to see top comments within each cluster
- Default view emphasizes consensus comments that transcend clusters

#### 4.2.5. Voting Mechanism
- Registered users can vote on comments as Helpful/Agree or Not Helpful/Disagree
- Community's aggregated behavior drives visibility, not manual moderation
- New users' votes/comments carry less weight until they've gained trust

#### 4.2.6. User Contributions and Summaries
- Users can write new comments to add missing context or point out bias
- System may prompt consolidated summaries for common issues
- Each news story accompanied by a dynamic, community-generated "context panel"

## 5. User Journey

### 5.1. Anonymous User Journey
1. **Landing & Browsing**: User sees a list of current top stories, each with a headline and source names
2. **Viewing a Story Cluster**: User can view multiple headlines and snippets from various sources covering the same story
3. **Community Insight Panel**: User sees community discussion highlights and consensus notes
4. **Reading Comments**: User can scroll through comments with indicators showing how different clusters responded
5. **No Participation Without Login**: Anonymous users cannot vote or add comments
6. **Encouragement to Register**: User may decide to create an account to contribute

### 5.2. Registered User Journey
1. **Onboarding**: User registers and learns about community guidelines
2. **Exploring & Personalization**: User can customize experience slightly while maintaining an unbiased feed
3. **Voting on a Comment**: User can mark comments as "Helpful" or "Not Helpful"
4. **Adding a Comment**: User can contribute their own comments or notes
5. **Earning Reputation**: User builds reputation through constructive participation
6. **User Profile and Following**: User has a profile showing their contributions and can follow specific topics

## 6. Inspiration & Competition

- **Pol.is**: Inspiration for clustering user comments and finding cross-cluster consensus
- **Twitter Community Notes**: Inspiration for elevating news story comments that achieve multi-perspective approval
- **Google News and Traditional Aggregators**: Inspiration for story clustering and breadth of sources
- **AllSides and Ground News**: Indirect competitors that validate the space but use static bias identification
- **Reddit and Discussion Forums**: Community discussion concept with added structure and summarization

## 7. Risks and Challenges

1. **Misinformation and Bad Actors**: Risk of false information or deliberate propaganda
2. **Bias Clustering Accuracy**: System's ability to cluster users by perspective is crucial
3. **Low Participation or Skewed Participation**: Value depends on diverse and active contributor base
4. **Miscalibrated Algorithm**: Risk of highlighting trivial consensus or missing key contentious points
5. **User Experience Complexity**: Interface must be intuitive for average users
6. **Performance and Scalability**: Technical challenges in aggregating sources and running real-time algorithms
7. **Legal and Safety Concerns**: Platform must not become a vector for harmful content

## 8. Technical Considerations

### 8.1. News Ingestion Pipeline
- Robust pipeline to fetch news from diverse sources
- Normalize data (titles, bodies, metadata)
- Tag articles with relevant categories

### 8.2. Article Clustering & Deduplication
- NLP techniques for story grouping
- Text embeddings to represent articles and cluster by semantic similarity
- Transformer models for embeddings combined with named entity recognition

### 8.3. Real-Time Consensus Algorithm
- Matrix-factorization or graph-based approach similar to Community Notes
- Infer latent "perspective" dimensions and "helpfulness" scores
- Design to avoid single-group domination

### 8.4. User Interface for Clusters and Notes
- Generate summary statistics for each comment
- Consider visualizations like a "perspective map"
- Handle real-time updates

### 8.5. Scalability & Infrastructure
- Microservices architecture
- Combination of traditional database and specialized stores
- Caching layers to handle high read traffic

### 8.6. Security & Data Privacy
- Basic security measures to protect API endpoints
- Ensure user privacy and secure storage of personal information
- Respect content usage rights

### 8.7. Third-Party Integrations
- Potential integration with external fact-checking APIs
- Social media sharing capabilities

## 9. Tech Stack

- **Frontend**: Next.js (App Router) with TypeScript
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Backend**: Next.js API routes (App Directory structure)
- **Database & Auth**: Supabase (PostgreSQL + Authentication)
- **Storage**: Supabase Storage (S3 bucket for assets if needed)
- **Schema Validation**: Zod
- **State Management**: React Context + React Query for data fetching

## 10. Out of Scope

- **Non-News Content & Non-English News**: Focus is strictly on English-language news articles
- **Editorial Bias Rating**: No manual tagging of articles or sources by bias
- **Direct Messaging or Social Networking Features**: No private messaging or friending
- **Heavy Manual Moderation**: Minimal human moderation, system driven by algorithms and crowd input
- **Personalized Echo Chambers**: No personalization that would create news bubbles
- **Monetization & Ads (Initial Phase)**: Initial focus on user growth and value
- **Full Automation of Truth Verification**: Platform does not claim to fact-check or resolve truth in news

## 11. Success Metrics

- **User Engagement**: Number of active users, comments, and votes
- **Content Coverage**: Number of sources aggregated and stories clustered
- **Consensus Quality**: Percentage of stories with meaningful consensus notes
- **User Retention**: Return rate of users, especially registered contributors
- **Diversity of Participation**: Distribution of users across different perspective clusters
- **Trust**: User surveys on perceived fairness and usefulness of the platform

## 12. Development Phases

### Phase 1: MVP (Minimum Viable Product)
- Basic news aggregation and story clustering
- Simple user accounts and comment system
- Initial implementation of voting and comment ranking

### Phase 2: Enhanced Crowdsourcing
- Refined clustering algorithm for user perspectives
- Improved consensus detection
- Better visualizations of perspective distribution

### Phase 3: Scale and Polish
- Performance optimizations for larger user base
- UI/UX improvements based on user feedback
- Additional filtering and customization options

## 13. Next Steps

1. Create detailed technical specifications
2. Develop UI/UX mockups
3. Set up Next.js project structure and Supabase integration
4. Implement core data models
5. Begin development of news ingestion pipeline 