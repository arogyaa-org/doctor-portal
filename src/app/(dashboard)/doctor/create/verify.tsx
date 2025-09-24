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
      // only remote DOC/DOCX should use Google doc viewer
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
      // Can't use Google viewer on blob: URL. Just open the blob and let the browser handle (download/OS handler).
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
      label: "Aadhaar Documents",
      field: "aadhaarDocs",
      description: "Upload Aadhaar card and related documents",
      color: "#FF9800",
      icon: Badge,
    },
    {
      label: "PAN Documents",
      field: "pancardDocs",
      description: "Upload PAN card and related documents",
      color: "#4CAF50",
      icon: CreditCard,
    },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {canManageDocs && (
        <>
          <Grid container spacing={3}>
            {documentCategories.map(
              ({ label, field, description, color, icon: IconComponent }) => {
                const files = values[field] || [];
                const hasFiles = files.length > 0;

                return (
                  <Grid item xs={12} lg={6} key={field}>
                    <Fade in timeout={300}>
                      <Card
                        elevation={2}
                        sx={{
                          height: "100%",
                          borderRadius: 3,
                          border: hasFiles
                            ? `2px solid ${color}`
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
                              sx={{ bgcolor: color, width: 48, height: 48 }}
                            >
                              <IconComponent />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                gutterBottom
                              >
                                {label}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {description}
                              </Typography>
                            </Box>
                            {hasFiles && (
                              <Chip
                                icon={<CheckCircle />}
                                label={`${files.length} file${files.length > 1 ? "s" : ""}`}
                                color="success"
                                variant="outlined"
                                size="small"
                              />
                            )}
                          </Stack>

                          <Divider sx={{ my: 2 }} />

                          <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<CloudUpload />}
                            sx={{
                              mb: 2,
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
                            Upload Documents
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

                          {hasFiles && (
                            <Stack spacing={1.5}>
                              {files.map((item: any, idx: number) => {
                                const isFile = typeof item !== "string";
                                const name = isFile ? item.name : item;
                                const preview = isFile && item.preview;
                                const fileSize = isFile ? item.size : null;
                                const fileType = isFile
                                  ? item.type
                                  : inferTypeFromUrl(item);

                                return (
                                  <Fade in timeout={300} key={idx}>
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
                              })}
                            </Stack>
                          )}

                          {!hasFiles && (
                            <Box
                              sx={{
                                textAlign: "center",
                                py: 3,
                                color: "text.secondary",
                                border: `2px dashed ${color}30`,
                                borderRadius: 2,
                                bgcolor: `${color}05`,
                              }}
                            >
                              <Upload
                                sx={{
                                  fontSize: 48,
                                  mb: 1,
                                  color: `${color}60`,
                                }}
                              />
                              <Typography variant="body2">
                                No documents uploaded yet
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.disabled"
                              >
                                Drag and drop or click to upload
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                );
              }
            )}
          </Grid>

          <Card
            elevation={0}
            sx={{
              mt: 4,
              bgcolor: "grey.50",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Security sx={{ color: "warning.main" }} />
                <Box>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Important Note
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Uploading new files for a section will replace the saved
                    list for that section on update. Supported formats: JPEG,
                    PNG, WebP, PDF, DOC, DOCX
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

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
                    Mark as verified once all documents have been reviewed
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={values.isVerified}
                    onChange={(event) => {
                      const wantToVerify = event.target.checked;
                      const total = [
                        "medicalCertificates",
                        "registrationCertificates",
                        "aadhaarDocs",
                        "pancardDocs",
                      ].reduce(
                        (sum, key) => sum + ((values as any)[key]?.length || 0),
                        0
                      );

                      if (wantToVerify && total < 2) {
                        toastAndNavigate(
                          dispatch,
                          true,
                          "error",
                          "Please upload at least 2 documents before marking as Verified.",
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
              You don't have permission to manage documents in this section
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Verify;
