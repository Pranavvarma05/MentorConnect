import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { getMenteesByMentorAndYear } from '../api';
import MiniLayout from './MiniLayout';
import { useMentee } from '../MenteeContext';
import { useAuth } from '../AuthContext';
import { useInView } from 'react-intersection-observer';
import './MenteesList.css';

const MenteesList = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const { setMenteeId } = useMentee();
  const { userId: mentorId } = useAuth();
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const yearMentees = await getMenteesByMentorAndYear(mentorId, year);
        setMentees(yearMentees);
        setLoading(false);
      } catch (error) {
        console.error(`Failed to fetch mentees for mentor ${mentorId} and year ${year}:`, error);
        setLoading(false);
      }
    };

    if (mentorId && year) {
      fetchMentees();
    }
  }, [mentorId, year]);

  const handleMenteeClick = (menteeId) => {
    setMenteeId(menteeId);
    navigate(`/menteedashboard/${menteeId}`);
  };

  if (loading) {
    return (
      <MiniLayout>
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Container>
      </MiniLayout>
    );
  }

  return (
    <MiniLayout>
      <Container>
        {mentees.length === 0 ? (
          <Typography variant="h5" component="div" style={{ textAlign: 'center', marginTop: '20px' }}>
            No mentees present.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {mentees.map((mentee) => (
              <MenteeCard key={mentee._id} mentee={mentee} onClick={() => handleMenteeClick(mentee._id)} />
            ))}
          </Grid>
        )}
      </Container>
    </MiniLayout>
  );
};

const MenteeCard = ({ mentee, onClick }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px',
  });

  useEffect(() => {
    if (inView) {
      document.getElementById(mentee._id).classList.add('visible');
    }
  }, [inView, mentee._id]);

  return (
    <Grid item xs={12} sm={6} md={3} ref={ref} id={mentee._id}>
      <Card
        className={`fade-in ${inView ? 'visible' : ''}`}
        onClick={onClick}
        style={{ width: 'auto', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}
      >
        <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
          <img src={mentee.photoLink} alt={`${mentee.name}'s profile`} style={{ width: 'auto', height: '200px', objectFit: 'cover', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', marginBottom: '20px' }} />
          <Typography variant="h6" component="div">
            Name - {mentee.name}
          </Typography>
          <Typography color="textSecondary">
            Registration - {mentee.registrationNumber}
          </Typography>
          <Typography color="textSecondary">
            Class - {mentee.class1}
          </Typography>
          <Typography color="textSecondary">
            Phone - {mentee.phone}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default MenteesList;
