-- Migration: Initial schema for News Aggregator with Crowdsourced Bias Insights
-- This should be run in a clean Postgres DB or used for reference in Supabase SQL editor

create table "User" (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null, -- hashed password (omit if using Supabase Auth)
  name text,
  "createdAt" timestamptz not null default now()
);

create table "StoryCluster" (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  "createdAt" timestamptz not null default now()
);

create table "Article" (
  id uuid primary key default gen_random_uuid(),
  url text unique not null,
  title text not null,
  content text not null,
  "publishedAt" timestamptz not null,
  source text not null,
  "storyClusterId" uuid references "StoryCluster"(id),
  "createdAt" timestamptz not null default now()
);

create table "Comment" (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references "User"(id) on delete cascade,
  "storyId" uuid not null references "StoryCluster"(id) on delete cascade,
  content text not null,
  "createdAt" timestamptz not null default now(),
  "consensusScore" float,
  "clusterLabel" text
);

create table "Vote" (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references "User"(id) on delete cascade,
  "commentId" uuid not null references "Comment"(id) on delete cascade,
  value integer not null, -- 1 = Helpful/Agree, -1 = Not Helpful/Disagree
  "createdAt" timestamptz not null default now()
);

-- Indexes for performance
create index idx_article_storyClusterId on "Article"("storyClusterId");
create index idx_comment_storyId on "Comment"("storyId");
create index idx_comment_userId on "Comment"("userId");
create index idx_vote_userId on "Vote"("userId");
create index idx_vote_commentId on "Vote"("commentId"); 