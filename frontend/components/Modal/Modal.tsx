import React, { useEffect, useState } from "react";
import { Autocomplete, Backdrop, Button, Grid, Modal, Stack, TextField } from "@mui/material";
import { ICourse } from "../../interfaces/ICourse";
import { useFormik } from "formik";
import { ProductSchema } from "../../utils/validators/schemas";
import {
  FormContainer,
  Input,
  ModalContainer,
  ModalContent,
  ModalTitle,
  PreviewImage,
} from "./styles";
import ImageInput from "../ImageInput/ImageInput";
import DefaultPhoto from "../../assets/img/default_photo.png"
import { categories } from "../../utils/mocks/category";
import { ICategories } from "../../interfaces/ICategories";
import { createCourse, getCourseById } from "../../api/courses";
import { Alert } from "../Alert/Alert";
import { IFilter } from "../../interfaces/IFilter";
import { useParams } from "next/navigation";

interface ICourseModal {
  open: boolean;
  handleClose: () => void;
  getAllCourse: (skip: number, filter: IFilter) => Promise<void>
}

const initialValues: ICourse = {
  title: "",
  description: "",
  price: 0,
  discountPercentage: 0,
  rating: 0,
  stock: 0,
  brand: "",
  category: [],
  thumbnail: "",
  images: [],
};



export default function CourseModal({
  open,
  handleClose,
  getAllCourse,
}: ICourseModal) {
  const params = useParams()
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(DefaultPhoto.src);

  const onSubmit = async (values: ICourse) => {
    try {
      const response = await createCourse(values)
      if (response) {
        Alert('success', 'Curso criado com sucesso')
        getAllCourse(0, { search: '', sort: '' })
        handleClose();
      }
    } catch (error) {
      Alert('error', error.details || 'Não foi possível criar o curso desejado')
      handleClose();
    }
  };


  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema: ProductSchema,
    enableReinitialize: true,
  });

  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setImageUrl(url);
      formik.setValues({
        ...formik.values,
        images: [url],
      });
    }
  }, [selectedImage]);

  const handlePrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event?.target.value;
    const numeric = parseInt(rawValue.replace(/[^0-9]/g, ""), 10) / 100;
    if (Number.isNaN(numeric)) {
      return;
    }
    formik.setFieldValue("price", numeric.toFixed(2).toString());
  };

  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Garante que o valor seja um número
    const rawValue = event?.target.value;
    const numeric = parseFloat(rawValue.replace(/[^0-9]/g, ""));

    // Verifica se o valor não é um número ou é NaN, define como zero
    if (Number.isNaN(numeric)) {
      return;
    }

    // Garante que o valor esteja na faixa de 0 a 100
    const discountValue = Math.min(Math.max(numeric, 0), 100);

    // Atualiza o estado do Formik com o valor percentual
    formik.setFieldValue('discountPercentage', discountValue);
  };

  const handleCategoriesChange = (categories: Array<ICategories>) => {
    formik.setFieldValue('category', categories);
  }

  return (
    <Modal
      open={open}
      onClose={() => handleClose()}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <ModalContainer>
        <ModalContent>
          <Stack>
            <ModalTitle>Criar Curso</ModalTitle>
            <FormContainer container spacing={2}>
              {imageUrl && (
                <Grid item xs={12} display="flex" justifyContent="center">
                  <PreviewImage src={imageUrl} alt="preview" />
                </Grid>
              )}
              <Grid item xs={12} display="flex" justifyContent="center">
                <ImageInput onChange={setSelectedImage} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Input
                  placeholder="Titulo"
                  id="title"
                  label="Titulo"
                  variant="outlined"
                  type="text"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="title"
                  error={Boolean(formik.errors.title)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Input
                  placeholder="Marca"
                  id="brand"
                  name="brand"
                  label="Marca"
                  variant="outlined"
                  type="text"
                  value={formik.values.brand}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.errors.brand)}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  data-testid="category"
                  multiple
                  id="category"
                  options={categories}
                  getOptionLabel={(option) => option.label}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Categorias"
                      placeholder="Categorias"
                    />
                  )}
                  value={formik.values.category}
                  onChange={(_, value) => handleCategoriesChange(value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Input
                  placeholder="Descrição"
                  id="description"
                  name="description"
                  label="Descrição"
                  variant="outlined"
                  type="text"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  multiline
                  error={Boolean(formik.errors.description)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Input
                  placeholder="Preço"
                  id="price"
                  name="price"
                  label="Preço"
                  variant="outlined"
                  type="text"
                  onBlur={formik.handleBlur}
                  value={formik.values.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handlePrice(e)
                  }
                  error={Boolean(formik.errors.price)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Input
                  placeholder="Desconto"
                  id="discountPercentage"
                  name="discountPercentage"
                  label="Desconto (em %)"
                  variant="outlined"
                  type="text"
                  value={formik.values.discountPercentage}
                  onBlur={formik.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleDiscountChange(e)
                  }
                  error={Boolean(formik.errors.discountPercentage)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Input
                  placeholder="Avaliação"
                  id="rating"
                  name="rating"
                  label="Avaliação (de 0 a 10)"
                  variant="outlined"
                  type="number"
                  value={formik.values.rating}
                  onChange={(e) => {
                    if (Number(e.target.value) <= 10 && Number(e.target.value) >= 0) {
                      formik.setFieldValue('rating', e.target.value);
                    }
                  }}
                  onBlur={formik.handleBlur}
                  inputProps={{
                    min: 0, max: 10,
                  }}
                  error={Boolean(formik.errors.rating)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Input
                  placeholder="Estoque"
                  id="stock"
                  name="stock"
                  label="Estoque"
                  variant="outlined"
                  type="number"
                  value={formik.values.stock}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  inputProps={{
                    min: 0,
                  }}
                  error={Boolean(formik.errors.stock)}
                />
              </Grid>
              <Grid item xs={6} display="flex" justifyContent="center">
                <Button
                  data-testid="createButton"
                  variant="contained"
                  sx={{ width: `200px` }}
                  onClick={() => formik.handleSubmit()}
                  disabled={!formik.isValid || !formik.dirty}
                >
                  Concluir
                </Button>
              </Grid>
              <Grid item xs={6} display="flex" justifyContent="center">
                <Button
                  data-testid="cancelButton"
                  variant="contained"
                  sx={{ width: `200px` }}
                  onClick={() => handleClose()}
                  color="error"
                >
                  Cancelar
                </Button>
              </Grid>
            </FormContainer>
          </Stack>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
}