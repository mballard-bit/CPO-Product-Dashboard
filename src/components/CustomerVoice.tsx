import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../styles/StyledComponents';

interface NpsComment {
  text: string;
  score: number | null;
  date: string | null;
}

interface Props {
  keywords: string[];
  refreshKey: number;
}

const Section = styled.div`
  background: ${colors.cardBackground};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const SectionHeader = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.warning};
    flex-shrink: 0;
  }
`;

const Comment = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid ${colors.border};
  &:last-child { border-bottom: none; padding-bottom: 0; }
  &:first-child { padding-top: 0; }
`;

const CommentText = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: ${colors.text};
  margin: 0 0 6px;
`;

const Meta = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Score = styled.span<{ score: number | null }>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  background: ${({ score }) =>
    score === null ? colors.border :
    score >= 9 ? '#e6f4ea' :
    score >= 7 ? '#fef7e0' : '#fce8e6'};
  color: ${({ score }) =>
    score === null ? colors.lightText :
    score >= 9 ? colors.success :
    score >= 7 ? colors.warning : colors.error};
`;

const Date = styled.span`
  font-size: 11px;
  color: ${colors.lightText};
`;

const Empty = styled.div`
  font-size: 12px;
  color: ${colors.lightText};
  padding: 8px 0;
`;

const CustomerVoice: React.FC<Props> = ({ keywords, refreshKey }) => {
  const [comments, setComments] = useState<NpsComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      keywords: keywords.join(','),
      limit: '3',
    });
    fetch(`/api/pendo/nps-comments?${params}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setComments(Array.isArray(d) ? d : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywords.join(','), refreshKey]);

  return (
    <Section>
      <SectionHeader>Customer Voice</SectionHeader>
      {loading && <Empty>Loading comments…</Empty>}
      {!loading && comments.length === 0 && (
        <Empty>No recent NPS comments found for this area</Empty>
      )}
      {!loading && comments.map((c, i) => (
        <Comment key={i}>
          <CommentText>"{c.text}"</CommentText>
          <Meta>
            {c.score !== null && <Score score={c.score}>NPS {c.score}</Score>}
            {c.date && <Date>{c.date}</Date>}
          </Meta>
        </Comment>
      ))}
    </Section>
  );
};

export default CustomerVoice;
