import {
  Box,
  Grid,
  Typography,
  Paper,
  IconButton,
  Checkbox,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Fade,
  Button,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Delete,
  Visibility,
  CloudUpload,
  VerifiedUser,
  Description,
  Image,
  PictureAsPdf,
  InsertDriveFile,
  Security,
  Assignment,
  Badge,
  CreditCard,
  CheckCircle,
  Upload,
  FolderZip,
} from "@mui/icons-material";
import { AppDispatch } from "@/redux/store";
import { Utility } from "@/utils";

interface VerifyProps {
  values: any;
  setFieldValue: any;
  role: string;
  canManageDocs: boolean;
  viewerOpen: boolean;
  setViewerOpen: (open: boolean) => void;
  viewerTitle: string;
  setViewerTitle: (title: string) => void;
  viewerType: "image" | "pdf" | "doc" | "unknown";
  setViewerType: (type: "image" | "pdf" | "doc" | "unknown") => void;
  viewerSrc: string;
  setViewerSrc: (src: string) => void;
  revokeOnClose: string | null;
  setRevokeOnClose: (src: string | null) => void;
  dispatch: AppDispatch;
  toastAndNavigate: Utility["toastAndNavigate"];
}

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const inferTypeFromUrl = (url: string): "image" | "pdf" | "doc" | "unknown" => {
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(png|jpe?g|webp|gif)$/.test(clean)) return "image";
  if (/\.pdf$/.test(clean)) return "pdf";
  if (/\.(docx?|rtf)$/.test(clean)) return "doc";
  return "unknown";
};

const googleDocViewer = (url: string) =>
  `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return <Image sx={{ color: "#4CAF50" }} />;
  if (type === "application/pdf")
    return <PictureAsPdf sx={{ color: "#F44336" }} />;
  if (type.includes("word") || type.includes("document"))
    return <Description sx={{ color: "#2196F3" }} />;
  return <InsertDriveFile sx={{ color: "#9E9E9E" }} />;
};

const getCategoryIcon = (field: string) => {
  switch (field) {
    case "medicalCertificates":
      return <Security sx={{ color: "#E91E63" }} />;
    case "registrationCertificates":
      return <Assignment sx={{ color: "#3F51B5" }} />;
    case "aadhaarDocs":
      return <Badge sx={{ color: "#FF9800" }} />;
    case "pancardDocs":
      return <CreditCard sx={{ color: "#4CAF50" }} />;
    case "combinedDocuments":
      return <FolderZip sx={{ color: "#9C27B0" }} />;
    default:
      return <Description sx={{ color: "#9E9E9E" }} />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const Verify: React.FC<VerifyProps> = ({
  values,
  setFieldValue,
  canManageDocs,
  viewerOpen,
  setViewerOpen,
  viewerTitle,
  setViewerTitle,
  viewerType,
  setViewerType,
  viewerSrc,
  setViewerSrc,
  revokeOnClose,
  setRevokeOnClose,
  dispatch,
  toastAndNavigate,
}) => {
  const handleAddFiles = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
    values: any,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const files = e.target.files;
    if (!files) return;

    const toAdd = Array.from(files)
      .map((f) => {
        if (!ALLOWED_MIME.includes(f.type)) {
          toastAndNavigate(
            dispatch,
            true,
            "error",
            `Unsupported file type: ${f.name}`,
            () => {}
          );
          return null as any;
        }
        if (f.size > MAX_FILE_SIZE) {
          toastAndNavigate(
            dispatch,
            true,
            "error",
            `File ${f.name} exceeds the 5MB size limit`,
            () => {}
          );
          return null as any;
        }
        return {
          file: f,
          name: f.name,
          size: f.size,
          type: f.type,
          preview: f.type.startsWith("image/")
            ? URL.createObjectURL(f)
            : undefined,
          uploadedAt: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    const prev = (values[fieldName] as any[]) ?? [];
    const next = [...prev, ...toAdd];
    setFieldValue(fieldName, next);
    e.target.value = "";
  };

  const removeAtIndex = (
    fieldName: string,
    idx: number,
    values: any,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const arr = (values[fieldName] as any[]) || [];
    const item = arr[idx] as any;
    if (item?.preview) URL.revokeObjectURL(item.preview);
    const next = arr.filter((_: any, i: number) => i !== idx);
    setFieldValue(fieldName, next);
  };

  const openViewer = (item: any) => {
    if (revokeOnClose) {
      URL.revokeObjectURL(revokeOnClose);
      setRevokeOnClose(null);
    }

    // Existing URL (remote)
    if (typeof item === "string") {
      const type = inferTypeFromUrl(item);
      setViewerTitle(item.split("/").pop() || "Document");
      setViewerType(type);
      setViewerSrc(type === "doc" ? googleDocViewer(item) : item);
      setViewerOpen(true);
      return;
    }

    // Local File object
    const f = item.file as File;
    const name = item.name || f.name;
    setViewerTitle(name);

    if (f.type.startsWith("image/")) {
      const src = item.preview ?? URL.createObjectURL(f);
      if (!item.preview) setRevokeOnClose(src);
      setViewerType("image");
      setViewerSrc(src);
      setViewerOpen(true);
      return;
    }

    if (f.type === "application/pdf") {
      const blobUrl = URL.createObjectURL(f);
      setRevokeOnClose(blobUrl);
      setViewerType("pdf");
      setViewerSrc(blobUrl);
      setViewerOpen(true);
      return;
    }

    if (
      f.type === "application/msword" ||
      f.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const blobUrl = URL.createObjectURL(f);
      setRevokeOnClose(blobUrl);
      setViewerType("doc");
      setViewerSrc(blobUrl);
      setViewerOpen(true);
      return;
    }

    const blobUrl = URL.createObjectURL(f);
    setRevokeOnClose(blobUrl);
    setViewerType("unknown");
    setViewerSrc(blobUrl);
    setViewerOpen(true);
  };

  const documentCategories = [
    {
      label: "Combined Documents",
      field: "combinedDocuments",
      description: "Upload combined or miscellaneous documents",
      color: "#9C27B0",
      icon: FolderZip,
    },
    {
      label: "Medical Certificates",
      field: "medicalCertificates",
      description: "Upload medical certificates and health documents",
      color: "#E91E63",
      icon: Security,
    },
    {
      label: "Registration Certificates",
      field: "registrationCertificates",
      description: "Upload registration and license documents",
      color: "#3F51B5",
      icon: Assignment,
    },
    {
      label: "Aadhaar Card",
      field: "aadhaarDocs",
      description: "Upload Aadhaar card",
      color: "#FF9800",
      icon: Badge,
    },
    {
      label: "PAN Card",
      field: "pancardDocs",
      description: "Upload PAN card",
      color: "#4CAF50",
      icon: CreditCard,
    },
  ];

  const allFiles = [
    ...(values.combinedDocuments || []),
    ...(values.medicalCertificates || []),
    ...(values.registrationCertificates || []),
    ...(values.aadhaarDocs || []),
    ...(values.pancardDocs || []),
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {canManageDocs && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Fade in timeout={300}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    border: allFiles.length > 0
                      ? `2px solid #2196F3`
                      : "2px solid transparent",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      elevation: 4,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      mb={2}
                    >
                      <Avatar
                        sx={{ bgcolor: "#2196F3", width: 48, height: 48 }}
                      >
                        <Description />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Document Upload
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Upload all required documents
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Supported formats: JPEG, PNG, WebP, PDF, DOC, DOCX (Max size: 5MB)
                        </Typography>
                      </Box>
                      {allFiles.length > 0 && (
                        <Chip
                          icon={<CheckCircle />}
                          label={`${allFiles.length} file${allFiles.length > 1 ? "s" : ""}`}
                          color="success"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      {documentCategories.map(
                        ({ label, field, color, icon: IconComponent }) => (
                          <Grid item xs={12} sm={6} md={4} key={field}>
                            <Button
                              variant="outlined"
                              component="label"
                              fullWidth
                              startIcon={<CloudUpload />}
                              sx={{
                                py: 1.5,
                                borderStyle: "dashed",
                                borderWidth: 2,
                                borderColor: color,
                                color: color,
                                "&:hover": {
                                  borderColor: color,
                                  backgroundColor: `${color}10`,
                                },
                              }}
                            >
                              {label}
                              <input
                                hidden
                                type="file"
                                multiple
                                accept={ALLOWED_MIME.join(",")}
                                onChange={(e) =>
                                  handleAddFiles(e, field, values, setFieldValue)
                                }
                              />
                            </Button>
                          </Grid>
                        )
                      )}
                    </Grid>

                    {allFiles.length > 0 && (
                      <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {documentCategories.map(({ field, color }) =>
                          (values[field] || []).map((item: any, idx: number) => {
                            const isFile = typeof item !== "string";
                            const name = isFile ? item.name : item;
                            const preview = isFile && item.preview;
                            const fileSize = isFile ? item.size : null;
                            const fileType = isFile
                              ? item.type
                              : inferTypeFromUrl(item);

                            return (
                              <Fade in timeout={300} key={`${field}-${idx}`}>
                                <Paper
                                  elevation={1}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${color}20`,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      bgcolor: `${color}05`,
                                      borderColor: `${color}40`,
                                    },
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                  >
                                    {preview ? (
                                      <Avatar
                                        src={preview}
                                        alt={name}
                                        variant="rounded"
                                        sx={{ width: 48, height: 48 }}
                                      />
                                    ) : (
                                      <Avatar
                                        variant="rounded"
                                        sx={{
                                          width: 48,
                                          height: 48,
                                          bgcolor: `${color}20`,
                                        }}
                                      >
                                        {getFileIcon(
                                          isFile
                                            ? fileType
                                            : (fileType as string)
                                        )}
                                      </Avatar>
                                    )}

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        noWrap
                                        title={name}
                                        sx={{ mb: 0.5 }}
                                      >
                                        {name}
                                      </Typography>
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                      >
                                        {fileSize && (
                                          <Chip
                                            label={formatFileSize(fileSize)}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                              height: 20,
                                              fontSize: "0.75rem",
                                            }}
                                          />
                                        )}
                                        {isFile && (
                                          <Chip
                                            label={item.type
                                              .split("/")[1]
                                              .toUpperCase()}
                                            size="small"
                                            sx={{
                                              height: 20,
                                              fontSize: "0.75rem",
                                              bgcolor: `${color}20`,
                                              color: color,
                                            }}
                                          />
                                        )}
                                      </Stack>
                                    </Box>

                                    <Stack direction="row" spacing={0.5}>
                                      <Tooltip title="Preview">
                                        <IconButton
                                          size="small"
                                          onClick={() => openViewer(item)}
                                          sx={{
                                            color: color,
                                            "&:hover": {
                                              bgcolor: `${color}10`,
                                            },
                                          }}
                                        >
                                          <Visibility fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Remove">
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            removeAtIndex(
                                              field,
                                              idx,
                                              values,
                                              setFieldValue
                                            )
                                          }
                                          sx={{
                                            color: "#F44336",
                                            "&:hover": {
                                              bgcolor: "#F4433610",
                                            },
                                          }}
                                        >
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                  </Stack>
                                </Paper>
                              </Fade>
                            );
                          })
                        )}
                      </Stack>
                    )}

                    {allFiles.length === 0 && (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 3,
                          color: "text.secondary",
                          border: `2px dashed #2196F330`,
                          borderRadius: 2,
                          bgcolor: `#2196F305`,
                          mt: 2,
                        }}
                      >
                        <Upload
                          sx={{
                            fontSize: 48,
                            mb: 1,
                            color: `#2196F360`,
                          }}
                        />
                        <Typography variant="body2">
                          No documents uploaded yet
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Drag and drop or click any button to upload
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>

          <Card
            elevation={0}
            sx={{
              mt: 3,
              borderRadius: 3,
              border: values.isVerified
                ? "2px solid #4CAF50"
                : "2px solid #E0E0E0",
              bgcolor: values.isVerified ? "#4CAF5010" : "transparent",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: values.isVerified ? "#4CAF50" : "#E0E0E0",
                    width: 48,
                    height: 48,
                  }}
                >
                  <VerifiedUser />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Verification Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mark as verified once at least one document has been uploaded and reviewed
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={values.isVerified}
                    onChange={(event) => {
                      const wantToVerify = event.target.checked;
                      const total = [
                        "combinedDocuments",
                        "medicalCertificates",
                        "registrationCertificates",
                        "aadhaarDocs",
                        "pancardDocs",
                      ].reduce(
                        (sum, key) => sum + ((values as any)[key]?.length || 0),
                        0
                      );

                      if (wantToVerify && total < 1) {
                        toastAndNavigate(
                          dispatch,
                          true,
                          "error",
                          "Please upload at least 1 document before marking as Verified.",
                          () => {}
                        );
                        return;
                      }

                      setFieldValue("isVerified", wantToVerify);
                    }}
                    sx={{
                      color: values.isVerified ? "#4CAF50" : "default",
                      "&.Mui-checked": { color: "#4CAF50" },
                      transform: "scale(1.2)",
                    }}
                  />
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    sx={{
                      ml: 1,
                      color: values.isVerified ? "#4CAF50" : "text.secondary",
                    }}
                  >
                    {values.isVerified ? "Verified" : "Not Verified"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </>
      )}

      {!canManageDocs && (
        <Card
          elevation={0}
          sx={{ textAlign: "center", py: 6, borderRadius: 3 }}
        >
          <CardContent>
            <Security sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Access Restricted
            </Typography>
            <Typography variant="body2" color="text.disabled">
               For verification, please contact the Operations Team.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Verify;