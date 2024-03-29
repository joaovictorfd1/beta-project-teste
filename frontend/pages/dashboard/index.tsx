import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Copyright } from '../../components/Copyright/Copyright';
import { getAllCourses, deleteCourse } from '../../api/courses';
import { ICourse } from '../../interfaces/ICourse';
import { Button, CircularProgress, Grid, Pagination, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import CourseModal from '../../components/Modal/Modal';
import { IFilter } from '../../interfaces/IFilter';
import ConfirmationModal from '../../components/Modal/ConfirmationModal/ConfirmationModal';
import { options } from '../../utils/mocks/options';
import { Alert } from '../../components/Alert/Alert';
import Nav from '../../components/Nav/Nav';
import CourseCard from '../../components/Card';

interface IResponseCourses {
  total: number
  skip: number
  limit: number
  courses: ICourse[]
}

export default function ListCourses() {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [id, setId] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [filter, setFilter] = useState<IFilter>({} as IFilter)
  const [coursesObjects, setCoursesObjects] = useState<IResponseCourses>({} as IResponseCourses)

  const getAllCourse = async (skip: number, filter: IFilter) => {
    const response = await getAllCourses(skip, filter)
    if (response) {
      return setCoursesObjects(response)
    }
    return setCoursesObjects({} as IResponseCourses)
  }

  const handleDeleteCourse = async () => {
    const response = await deleteCourse(id)
    if (response && response.message) {
      Alert('success', response.message)
      getAllCourse((currentPage - 1) * 15, filter)
      return setDeleteModalOpen(false)
    }
    Alert('error', response.details)
  }

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value)
  };

  const numberOfPages = () => {
    return coursesObjects.total / 15;
  };

  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFilter({
      ...filter,
      search: value,
    });
  };


  useEffect(() => {
    getAllCourse((currentPage - 1) * 15, filter)
  }, [currentPage, filter])

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login')
      return;
    }
  }, [])

  return (
    <Nav>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container alignItems={'center'} mb={'8px'}>
          <Grid item xs={6}>
            <Box component={'div'} display={'flex'} gap={'16px'}>
              <TextField
                data-testid="search"
                type="text"
                value={filter.search}
                onChange={handleFilter}
                label="Buscar por nome ou marca"
                size="small"
              />

              <TextField
                data-testid="order"
                select
                type="text"
                label="Ordernar por:"
                size="small"
                SelectProps={{
                  native: true,
                }}
                onChange={(e) => setFilter({
                  ...filter,
                  sort: e.target.value
                })}
                sx={{ minWidth: '150px' }}
              >
                {options.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </TextField>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box component={'div'} display={'flex'} justifyContent={'flex-end'}>
              <Button
                data-testid="new"
                type='button'
                variant="contained"
                onClick={() => setCreateModalOpen(true)}
              >
                Novo Curso
              </Button>
            </Box>
          </Grid>
        </Grid>
        {coursesObjects && coursesObjects.courses?.length === 0 ? (
          <Box sx={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container rowGap='24px' columnGap='12px' paddingBottom='48px' paddingTop='112px' justifyContent='center'>
            {coursesObjects && coursesObjects.courses?.map((course: ICourse) => <CourseCard key={course.id} course={course} setId={setId} setDeleteModalOpen={setDeleteModalOpen} />)}
          </Grid>
        )}
        <Copyright sx={{ pt: 4 }} />
      </Container>
      {Math.floor(numberOfPages()) > 0 && (
        <Pagination
          count={Math.floor(numberOfPages())}
          page={currentPage}
          onChange={handlePaginationChange}
        />
      )}
      <CourseModal
        handleClose={() => setCreateModalOpen(false)}
        open={createModalOpen}
        getAllCourse={getAllCourse}
      />
      <ConfirmationModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        confirmAction={() => handleDeleteCourse()}
        cancelAction={() => setDeleteModalOpen(false)} />
    </Nav>
  );
}